"use client";

import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";
import { IconButton } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function OrgTree({
  level1List,
  level2List,
  level3List,
  level4List,
  level5List,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) {
  const [treeData, setTreeData] = useState([]);

  // Tree uchun data hosil qilish
  useEffect(() => {
    if (!level1List?.data) return;

    const childMap = {};
    [level2List, level3List, level4List, level5List].forEach((level) => {
      if (!level?.data) return;
      level.data.forEach((node) => {
        if (!childMap[node.parent_id]) childMap[node.parent_id] = [];
        childMap[node.parent_id].push(node);
      });
    });

    const mapLevel = (nodes, childMap, level = 1) => {
      return nodes.map((node) => ({
        name: node.name,
        nodeData: node,
        children: childMap[node.id]
          ? mapLevel(childMap[node.id], childMap, level + 1)
          : [],
        collapsed: true,
      }));
    };

    setTreeData(mapLevel(level1List.data, childMap));
  }, [level1List, level2List, level3List, level4List, level5List]);

  // Custom node element
  const renderNode = ({ nodeDatum, toggleNode }) => (
    <div
      style={{
        padding: "6px 10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        minWidth: "120px",
      }}
      onClick={toggleNode} // click qilib collapsible qilish
    >
      <span>{nodeDatum.name}</span>
      <div
        style={{ display: "flex", gap: "4px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {onAddClick && (
          <IconButton
            size="small"
            onClick={() => onAddClick(nodeDatum.nodeData)}
          >
            <AddCircleIcon sx={{ color: "#1E5EFF" }} fontSize="small" />
          </IconButton>
        )}
        {onEditClick && (
          <IconButton
            size="small"
            onClick={() => onEditClick(nodeDatum.nodeData)}
          >
            <EditIcon sx={{ color: "#FFC700" }} fontSize="small" />
          </IconButton>
        )}
        {onDeleteClick && (
          <IconButton
            size="small"
            onClick={() => onDeleteClick(nodeDatum.nodeData)}
          >
            <DeleteIcon sx={{ color: "#FF4D4D" }} fontSize="small" />
          </IconButton>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "700px", overflow: "auto" }}>
      <Tree
        data={treeData}
        collapsible={true}
        orientation="vertical"
        renderCustomNodeElement={renderNode}
        pathFunc="step"
        translate={{ x: 400, y: 50 }}
      />
    </div>
  );
}
