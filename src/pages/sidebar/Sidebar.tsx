import { useEffect } from "react";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

// 侧边栏组件，支持响应式隐藏与展开
const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, children }) => {
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
        <div className="sidebar-mask" />
      )}
      <div
        className={"sidebar-container " + (visible ? "sidebar-container-visible" : "sidebar-container-hidden")}
      >{children}</div>
    </>
  );
};

export default Sidebar;