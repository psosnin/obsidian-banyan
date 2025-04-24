export const SidebarContent = ({notesNum, tagsNum}:{notesNum: number, tagsNum: number}) => {
    return <div style={{ padding: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: 280, marginLeft: 16, marginTop: 56 }}>
        <div>
            <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>{notesNum}</span>
            <br/>
            <span style={{ fontSize: 9}}>笔记</span>
        </div>
        <div>
            <span style={{ fontSize: 'var(--font-ui-large)', fontWeight: 'var(--font-medium)',}}>{tagsNum}</span>
            <br/>
            <span style={{ fontSize: 9}}>标签</span>
        </div>
  </div>;
}