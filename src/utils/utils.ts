export function legalFileName(fileName: string) {
    return !/[\[\]#^|\\/:]/.test(fileName);
  }
  