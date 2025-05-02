import { Icon } from "src/components/Icon";

const EmptyStateCard = ({isSearch}: {isSearch: boolean}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            background: 'var(--background-secondary)',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '48px 24px',
            width: 600
        }}>
            {isSearch && <>
                <div style={{ marginBottom: 24 }}><Icon name="file-search" size={72} color="var(--text-muted)" /></div>
                <div style={{ fontSize: 20, color: 'var(--text-normal)', fontWeight: 500, marginBottom: 8 }}>无搜索结果</div>
            </>}
            {!isSearch && <>
                <div style={{ marginBottom: 24 }}><Icon name="file-plus" size={72} color="var(--text-muted)" /></div>
                <div style={{ fontSize: 20, color: 'var(--text-normal)', fontWeight: 500, marginBottom: 8 }}>暂无笔记</div> 
            </>}
        </div>
    );
};

export default EmptyStateCard;