import { useEffect } from "react";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  width?: number;
  children?: React.ReactNode;
}

// 侧边栏组件，支持响应式隐藏与展开
const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, width = 320, children }) => {
  // 监听点击遮罩关闭
  useEffect(() => {
    if (!visible) return;
    const handle = (e: MouseEvent) => {
      // 只在点击遮罩时关闭
      if ((e.target as HTMLElement).classList.contains("sidebar-mask")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [visible, onClose]);

  return (
    <>
      {/* 遮罩层 */}
      {visible && (
        <div className="sidebar-mask" style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.08)",
          zIndex: 1000
        }} />
      )}
      <div
        className="sidebar-container"
        style={{
          position: "fixed",
          left: visible ? 0 : -width,
          top: 0,
          width,
          height: "100vh",
          background: "var(--background-secondary, #222)",
          color: "var(--text-normal, #fff)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          zIndex: 1001,
          transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </>
  );
};

export default Sidebar;