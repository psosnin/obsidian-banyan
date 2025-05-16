import { TFile } from 'obsidian';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'
import { i18n } from 'src/utils/i18n';

export type HeatmapData = {
    date: string,
    count: number,
}

export const Heatmap = ({ values, onCickDate }: {
    values: HeatmapData[], onCickDate: (date: string) => void
}) => {
    const today = new Date();
    return (
        <div>
            <CalendarHeatmap
                startDate={shiftDate(today, -12 * 7)}
                endDate={today}
                onClick={(value) => value && onCickDate(value.date)}
                values={values}
                gutterSize={6}
                classForValue={(value: HeatmapData) => {
                    if (!value || value.count === 0) {
                        return 'color-scale-0';
                    }
                    const cnt = Math.min(4, Math.ceil(value.count / 4));
                    return `color-scale-${cnt}`;
                }}
                tooltipDataAttrs={(value: HeatmapData): { [key: string]: string } => {
                    return {
                        // 'data-tooltip': `${value.count} 条笔记于 ${value.date.toISOString().slice(0, 10)}`,
                        'data-tooltip-id': 'my-tooltip',
                        'data-tooltip-content': value.count != undefined && value.date != undefined ? `${value.count} 条笔记创建于 ${value.date}` : '',
                    };
                }}
                showWeekdayLabels={false}
                monthLabels={[
                    i18n.t('month1'), i18n.t('month2'), i18n.t('month3'), 
                    i18n.t('month4'), i18n.t('month5'), i18n.t('month6'), 
                    i18n.t('month7'), i18n.t('month8'), i18n.t('month9'), 
                    i18n.t('month10'), i18n.t('month11'), i18n.t('month12'), 
                ]}
                showOutOfRangeDays={true}
            />
            <Tooltip id="my-tooltip" style={{ zIndex: 2001 }} />
        </div>
    );
}

const shiftDate = (date: Date, numDays: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
}

export const getHeatmapValues = (files: TFile[]) => {
    const valueMap = files
        .map(file => {
            const date = new Date(file.stat.ctime); // 记录创建时间，记录修改时间没意义
            const offset = date.getTimezoneOffset();
            date.setTime(date.getTime() - offset * 60 * 1000); // offset是毫秒，要变成小时
            return date.toISOString().slice(0, 10);
        })
        .reduce<Map<string, number>>(
            (pre, cur) => pre.set(cur, pre.has(cur) ? pre.get(cur)! + 1 : 1),
            new Map<string, number>());
    return Array
        .from(valueMap.entries())
        .map(([key, value]) => {
            return { date: key, count: value };
        }); // 第一层转换
}

// 调试用
// const getRange = (count:number) => {
//     return Array.from({ length: count }, (_, i) => i);
// }

// const getRandomInt = (min: number, max: number) => {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// const randomValues = getRange(200).map(index => {
//     const today = new Date();
//     return {
//         date: shiftDate(today, -index).toISOString().slice(0, 10),
//         count: getRandomInt(1, 30),
//     };
// });