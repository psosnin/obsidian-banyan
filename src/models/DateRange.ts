export interface DateRange {
    from: string;
    to: string;
}

export const withinDateRange = (time: number, dateRange: DateRange) => {
    const fromDate = dateRange.from.length > 0 ? (new Date(dateRange.from)) : undefined;
    const toDate = dateRange.to.length > 0 ? (new Date(dateRange.to)) : undefined;
    if (toDate) toDate.setDate(toDate.getDate() + 1); // 要加一天，因为 toDate 是包含的

    const from = fromDate ? fromDate.setHours(0, 0, 0, 0) : undefined;
    const to = toDate ? toDate.setHours(0, 0, 0, 0) : undefined;

    if (!from && !to) return true;
    if (from && !to) return time >= from;
    if (!from && to) return time <= to;
    return time >= from! && time <= to!;
}

export const emptyDateRange = () => {
    return {
        from: "",
        to: ""
    }
};

export const isEmptyDateRange = (dateRange: DateRange) => {
    return dateRange.from === "" && dateRange.to === "";
}