import { Icon } from "src/components/Icon";
import {i18n} from "src/utils/i18n";

const EmptyStateCard = ({isSearch}: {isSearch: boolean}) => {
    return (
        <div className="empty-state-card">
            {isSearch && <>
                <div className="empty-state-card-icon"><Icon name="file-search" size={72} color="var(--text-muted)" /></div>
                <div className="empty-state-card-text">{i18n.t('empty_search_result')}</div>
            </>}
            {!isSearch && <>
                <div className="empty-state-card-icon"><Icon name="file-plus" size={72} color="var(--text-muted)" /></div>
                <div className="empty-state-card-text">{i18n.t('empty_note_result')}</div> 
            </>}
        </div>
    );
};

export default EmptyStateCard;