import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'

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
                        'data-tooltip-content': value.count != undefined && value.date != undefined ? `${value.count} 条笔记于 ${value.date}` : '',
                    };
                }}
                showWeekdayLabels={false}
                monthLabels={['一月', '二月', '三月',
                    '四月', '五月', '六月',
                    '七月', '八月', '九月',
                    '十月', '十一月', '十二月']}
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