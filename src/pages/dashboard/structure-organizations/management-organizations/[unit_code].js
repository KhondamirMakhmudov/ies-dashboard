import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { get } from "lodash";
import { useSession } from "next-auth/react";
import PeopleIcon from "@mui/icons-material/People";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ContentLoader from "@/components/loader";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

// Color palette per depth level
const LEVEL_COLORS = [
  "#2563eb", // depth 0 – blue
  "#0891b2", // depth 1 – cyan
  "#059669", // depth 2 – green
  "#d97706", // depth 3 – amber
  "#dc2626", // depth 4 – red
  "#7c3aed", // depth 5 – violet
];

const LEVEL_LABELS = [
  "Корневой узел",
  "Дочерние ветви",
  "Подразделения",
  "Глубокий уровень",
];

const CARD_W = 280;
const CARD_MAX_H = 152;

const UnitTreePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDark } = useAppTheme();
  const treeContainerRef = useRef(null);
  const treeSizeRef = useRef({ width: 0, height: 0 });
  const [treeKey, setTreeKey] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const canReadOrgUnit = canUserDo(
    session?.user,
    "organizational-unit",
    "all-read",
  );

  const unitCode = useMemo(() => {
    if (Array.isArray(router.query.unit_code)) {
      return router.query.unit_code[0] || "";
    }
    return router.query.unit_code || "";
  }, [router.query.unit_code]);

  useEffect(() => {
    const updateSize = () => {
      if (!treeContainerRef.current) return;
      treeSizeRef.current = {
        width: treeContainerRef.current.clientWidth,
        height: treeContainerRef.current.clientHeight,
      };
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { data: allUnitsData, isLoading: isLoadingAll } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, "tree-all-units"],
    url: URLS.organizationalUnits,
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    params: { limit: 5000 },
    enabled: !!session?.accessToken && canReadOrgUnit,
  });

  const allUnits = get(allUnitsData, "data", []);

  const unitsById = useMemo(() => {
    const map = new Map();
    allUnits.forEach((item) => map.set(item.id, item));
    return map;
  }, [allUnits]);

  const selectedUnit = useMemo(
    () => allUnits.find((item) => String(item.unit_code) === String(unitCode)),
    [allUnits, unitCode],
  );

  const rootUnits = useMemo(
    () =>
      allUnits.filter(
        (item) => item.is_root === true || item.parent_id == null,
      ),
    [allUnits],
  );

  const rootUnit = useMemo(() => {
    if (!selectedUnit) return null;
    let current = selectedUnit;
    const visited = new Set();
    while (current?.parent_id != null) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      const parent = unitsById.get(current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current;
  }, [selectedUnit, unitsById]);

  const childrenByParentId = useMemo(() => {
    const map = new Map();
    allUnits.forEach((item) => {
      if (!map.has(item.parent_id)) map.set(item.parent_id, []);
      map.get(item.parent_id).push(item);
    });
    return map;
  }, [allUnits]);

  const treeData = useMemo(() => {
    if (!allUnits.length) return [];

    const visited = new Set();

    const buildNode = (node, depth = 0) => {
      if (visited.has(node.id)) return null;
      visited.add(node.id);

      const children = (childrenByParentId.get(node.id) || [])
        .map((child) => buildNode(child, depth + 1))
        .filter(Boolean);

      const workplaces = get(node, "workplace", []);
      const employees = workplaces
        .filter((wp) => !wp.is_vacant && wp.employee)
        .map((wp) => ({
          name: [
            wp.employee.last_name,
            wp.employee.first_name,
            wp.employee.middle_name,
          ]
            .filter(Boolean)
            .join(" "),
          position: wp.position?.name || "",
        }));

      return {
        id: node.id,
        name: node.name,
        unitCode: node.unit_code || "-",
        depth,
        selected: node.id === selectedUnit?.id,
        employees,
        totalWorkplaces: workplaces.length,
        vacantCount: workplaces.filter((wp) => wp.is_vacant).length,
        children,
      };
    };

    if (rootUnit) {
      const rootNode = buildNode(rootUnit, 0);
      return rootNode ? [rootNode] : [];
    }
    return rootUnits.map((unit) => buildNode(unit, 0)).filter(Boolean);
  }, [allUnits, rootUnit, rootUnits, selectedUnit, childrenByParentId]);

  const treeNodeMap = useMemo(() => {
    const map = new Map();

    const visit = (nodes) => {
      nodes.forEach((node) => {
        map.set(node.id, node);
        if (node.children?.length) {
          visit(node.children);
        }
      });
    };

    visit(treeData);
    return map;
  }, [treeData]);

  const fallbackActiveNodeId =
    selectedUnit?.id || rootUnit?.id || treeData[0]?.id || null;

  useEffect(() => {
    if (!fallbackActiveNodeId) return;
    if (!activeNodeId || !treeNodeMap.has(activeNodeId)) {
      setActiveNodeId(fallbackActiveNodeId);
    }
  }, [activeNodeId, fallbackActiveNodeId, treeNodeMap]);

  const activeNode =
    (activeNodeId ? treeNodeMap.get(activeNodeId) : null) ||
    (fallbackActiveNodeId ? treeNodeMap.get(fallbackActiveNodeId) : null) ||
    null;

  const renderNode = ({ nodeDatum, toggleNode }) => {
    const isSelected = nodeDatum.selected === true;
    const isActive = nodeDatum.id === activeNodeId;
    const depth = nodeDatum.depth || 0;
    const accentColor = isActive
      ? "#0f766e"
      : isSelected
        ? "#16a34a"
        : LEVEL_COLORS[depth % LEVEL_COLORS.length];

    const cardBorder = isDark ? "#334155" : "#e2e8f0";
    const employees = nodeDatum.employees || [];
    const occupied = nodeDatum.totalWorkplaces - nodeDatum.vacantCount;

    return (
      <g>
        <foreignObject
          x={-CARD_W / 2}
          y={-CARD_MAX_H / 2}
          width={CARD_W}
          height={CARD_MAX_H}
        >
          {/* xmlns required so React renders as HTML inside SVG */}
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            onClick={() => {
              setActiveNodeId(nodeDatum.id);
              toggleNode();
            }}
            className={`flex h-[152px] w-[280px] cursor-pointer select-none flex-col rounded-[14px] border px-3 pb-2.5 pt-3 font-sans shadow-[0_14px_32px_rgba(15,23,42,0.10)] ${
              isDark
                ? "bg-slate-800 shadow-[0_14px_32px_rgba(2,6,23,0.42)]"
                : "bg-white"
            }`}
            style={{
              border: `1px solid ${isActive ? accentColor : cardBorder}`,
              borderTop: `4px solid ${accentColor}`,
            }}
          >
            <div
              className={`mb-2.5 overflow-hidden text-xs font-bold leading-[1.3] ${
                isSelected ? "" : isDark ? "text-slate-100" : "text-slate-900"
              }`}
              style={{
                color: isSelected ? accentColor : undefined,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {nodeDatum.name}
            </div>

            {/* Badges row: unit code + occupancy */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: accentColor + "22",
                  color: accentColor,
                  border: `1px solid ${accentColor}44`,
                }}
              >
                #{nodeDatum.unitCode}
              </span>

              {nodeDatum.totalWorkplaces > 0 && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1 ${
                    isDark
                      ? "bg-sky-950 text-sky-300"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <PeopleIcon sx={{ fontSize: 14 }} />
                  {`${occupied}/${nodeDatum.totalWorkplaces}`}
                </span>
              )}

              {nodeDatum.vacantCount > 0 && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1 ${
                    isDark
                      ? "bg-orange-950 text-orange-300"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  <CheckBoxOutlineBlankIcon sx={{ fontSize: 14 }} />
                  {`${nodeDatum.vacantCount} свободно`}
                </span>
              )}
            </div>
            <div
              className="mt-auto flex items-center justify-between gap-2 border-t pt-2"
              style={{
                borderTop: `1px solid ${cardBorder}`,
              }}
            >
              <span
                className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {employees.length > 0
                  ? `${employees.length} сотрудник(ов)`
                  : "Без сотрудников"}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{
                  color: isActive ? "#0f766e" : accentColor,
                }}
              >
                {isActive ? "Открыто справа" : "Нажмите"}
              </span>
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  if (!canReadOrgUnit) {
    return (
      <div
        className={`flex h-screen w-screen items-center justify-center ${
          isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div>У вас нет доступа для просмотра организационных единиц.</div>
      </div>
    );
  }

  if (isLoadingAll) {
    return (
      <div
        className={`flex h-screen w-screen items-center justify-center ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <ContentLoader />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Top Header Bar */}
      <div
        className={`shrink-0 border-b px-[18px] pb-[14px] pt-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${
          isDark
            ? "border-slate-700 bg-gradient-to-br from-gray-900 to-slate-800 shadow-[0_10px_30px_rgba(2,6,23,0.30)]"
            : "border-slate-200 bg-gradient-to-br from-white to-slate-50"
        }`}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap justify-between items-start gap-2.5">
            <div>
              <span
                className={`mb-1.5 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${
                  isDark
                    ? "bg-blue-500/15 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Схема слева направо
              </span>
              <div
                className={`text-[22px] font-extrabold leading-[1.1] ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              >
                Иерархия подразделений
              </div>
              <div
                className={`mt-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Полноэкранный режим для навигации по структуре и сотрудникам
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTreeKey((k) => k + 1)}
                className="inline-flex h-[38px] items-center justify-center rounded-[10px] bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-800"
              >
                Сбросить вид
              </button>
              <Link
                href="/dashboard/structure-organizations/management-organizations"
                className="ml-auto inline-flex h-[38px] items-center justify-center rounded-[10px] border border-slate-300 bg-slate-200 px-4 text-sm font-bold no-underline text-slate-900 transition-colors hover:bg-slate-300 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Закрыть ×
              </Link>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          className={`mt-3 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {unitCode && !selectedUnit ? (
            <span className={isDark ? "text-rose-300" : "text-rose-600"}>
              Организационная единица не найдена по коду: <strong>{unitCode}</strong>
            </span>
          ) : rootUnit ? (
            <>
              <strong>Корень иерархии:</strong>{" "}
              <span className={isDark ? "text-slate-100" : "text-slate-900"}>
                {rootUnit.name}
              </span>
              {selectedUnit && selectedUnit.id !== rootUnit.id && (
                <>
                  {" "}
                  <strong>· Выбрано:</strong>{" "}
                  <span className="text-green-600">{selectedUnit.name}</span>
                </>
              )}
            </>
          ) : (
            "Отображение всех корневых единиц"
          )}
        </div>

        {/* Legend */}
        <div
          className={`mt-3 flex flex-wrap gap-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {LEVEL_COLORS.slice(0, 4).map((color, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                style={{
                  background: color,
                }}
              />
              {LEVEL_LABELS[i]}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-green-600" />
            Текущий узел
          </span>
        </div>
      </div>

      {/* Tree canvas – fills remaining space */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] overflow-hidden">
        <div
          ref={treeContainerRef}
          className={`relative overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}
        >
          {treeData.length > 0 && (
            <Tree
              key={treeKey}
              data={treeData}
              dimensions={{
                width: treeSizeRef.current?.width || 1100,
                height: treeSizeRef.current?.height || 800,
              }}
              orientation="vertical"
              pathFunc="step"
              translate={{
                x: (treeSizeRef.current?.width || 1100) / 2,
                y: 80,
              }}
              separation={{ siblings: 1.2, nonSiblings: 2.0 }}
              renderCustomNodeElement={renderNode}
              zoomable
              collapsible
              nodeSize={{ x: 340, y: 230 }}
              initialDepth={2}
              styles={{
                links: {
                  stroke: isDark ? "#334155" : "#94a3b8",
                  strokeWidth: 2.5,
                },
              }}
            />
          )}
          <div
            className={`pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}
          >
            Прокрутите колесиком — масштаб · Зажмите и тяните — перемещение ·
            Нажмите на узел — открыть детали
          </div>
        </div>

        <div
          className={`flex min-h-0 flex-col border-l ${
            isDark
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`border-b px-[18px] pb-[14px] pt-[18px] ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <div
              className={`mb-2 text-xs font-bold uppercase tracking-[0.06em] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Детали узла
            </div>
            <div
              className={`text-[20px] font-extrabold leading-[1.2] ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              {activeNode?.name || "Выберите подразделение"}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeNode && (
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                    isDark
                      ? "bg-sky-950 text-sky-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  #{activeNode.unitCode}
                </span>
              )}
              {activeNode && (
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                    isDark
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {activeNode.totalWorkplaces - activeNode.vacantCount}/
                  {activeNode.totalWorkplaces} занято
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-[18px] pb-[18px] pt-4">
            <div
              className={`mb-3 text-xs font-bold ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Сотрудники {activeNode ? `(${activeNode.employees.length})` : ""}
            </div>

            {activeNode?.employees?.length ? (
              <div className="flex flex-col gap-2.5">
                {activeNode.employees.map((emp, index) => (
                  <div
                    key={`${emp.name}-${index}`}
                    className={`rounded-xl border px-3 py-3 ${
                      isDark
                        ? "border-slate-700 bg-gray-900"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`text-sm font-bold leading-[1.35] ${
                        isDark ? "text-slate-50" : "text-slate-900"
                      }`}
                    >
                      {emp.name}
                    </div>
                    {emp.position && (
                      <div
                        className={`mt-1 text-xs leading-[1.4] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {emp.position}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-xl border border-dashed px-3.5 py-[18px] text-[13px] ${
                  isDark
                    ? "border-slate-600 bg-slate-400/5 text-slate-400"
                    : "border-slate-300 bg-slate-50 text-slate-500"
                }`}
              >
                В выбранном подразделении нет сотрудников.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitTreePage;
