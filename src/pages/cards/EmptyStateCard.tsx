import { Icon } from "src/components/Icon";

const EmptyStateCard = ({isSearch}: {isSearch: boolean}) => {
    return (
        <div className="empty-state-card">
            {isSearch && <>
                <div className="empty-state-card-icon"><Icon name="file-search" size={72} color="var(--text-muted)" /></div>
                <div className="empty-state-card-text">无搜索结果</div>
            </>}
            {!isSearch && <>
                <div className="empty-state-card-icon"><Icon name="file-plus" size={72} color="var(--text-muted)" /></div>
                <div className="empty-state-card-text">暂无笔记</div> 
            </>}
        </div>
    );
};

export default EmptyStateCard;