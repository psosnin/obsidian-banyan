
export type TagFilter = {
  or: string[][]; // 多行，每行多个标签，行内为且
  not: string[];   // 非关系标签
  noTag: 'unlimited' | 'include' | 'exclude';
};

export const emptyTagFilter = (): TagFilter => {
  return {
    or: [[]],
    not: [],
    noTag: 'unlimited'
  };
};

export const isOKWithTagFilter = (fileTags: string[], filter: TagFilter) => {
  const notTags = filter.not;
  const orTags = filter.or.filter(row => row.length > 0); // 优化 或标签组

  // *** 排除 ***
  // 要排除的标签
  for (const noTag of notTags) {
    if (fileTags.some(fileTag => fileTag.startsWith(noTag))) {
      return false;
    }
  }
  // 排除无标签
  if (filter.noTag == 'exclude' && fileTags.length === 0) return false;

  // *** 包含 ***
  // 没有包含意义的过滤项，则不过滤
  if (orTags.length === 0 && filter.noTag != 'include') return true;
  // 考虑每一个过滤项
  if (filter.noTag == 'include' && fileTags.length === 0) return true;
  for (const andTags of orTags) {
    if (andTags.every(tag => fileTags.some(fileTag => fileTag.startsWith(tag)))) {
      return true;
    }
  }
  return false;
}

export const isEmptyTagFilter = (filter: TagFilter) => {
  return filter.or.filter(row => row.length > 0).length === 0 && filter.not.length === 0 && filter.noTag === 'unlimited';
}