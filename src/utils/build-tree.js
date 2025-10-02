function buildTree(level1List, level2List, level3List, level4List, level5List) {
  return level1List?.data?.map((l1) => ({
    id: l1.id,
    name: l1.name,
    children: level2List?.data
      ?.filter((l2) => l2.parent_id === l1.id)
      .map((l2) => ({
        id: l2.id,
        name: l2.name,
        children: level3List?.data
          ?.filter((l3) => l3.parent_id === l2.id)
          .map((l3) => ({
            id: l3.id,
            name: l3.name,
            children: level4List?.data
              ?.filter((l4) => l4.parent_id === l3.id)
              .map((l4) => ({
                id: l4.id,
                name: l4.name,
                children: level5List?.data
                  ?.filter((l5) => l5.parent_id === l4.id)
                  .map((l5) => ({
                    id: l5.id,
                    name: l5.name,
                    children: [],
                  })),
              })),
          })),
      })),
  }));
}
