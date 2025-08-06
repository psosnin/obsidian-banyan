import { App, TFile } from "obsidian";
import { TitleDisplayMode } from "src/models/Enum";

/**
 * 获取文件的frontmatter属性标题
 * @param app Obsidian应用实例
 * @param file 文件对象
 * @param propertyName 属性名称，默认为'title'
 * @returns 属性值，如果不存在则返回null
 */
export const getFrontmatterProperty = async (app: App, file: TFile, propertyName: string = 'title'): Promise<string | null> => {
    try {
        let title: string | null = null;
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            if (frontmatter.title) {
                title = frontmatter.title;
            }
        });
        return title;
    } catch (error) {
        console.log('Error getting frontmatter property:', error);
        return null;
    }
};

/**
 * 根据显示模式获取应该显示的标题
 * @param app Obsidian应用实例
 * @param file 文件对象
 * @param mode 显示模式
 * @returns 应该显示的标题，如果不需要显示则返回null
 */
export const getDisplayTitle = async (
    app: App,
    file: TFile,
    mode: TitleDisplayMode
): Promise<string | null> => {
    if (mode === 'none') {
        return null;
    }

    if (mode === 'fileOnly') {
        return file.basename;
    }

    const propertyTitle = await getFrontmatterProperty(app, file);

    if (mode === 'propertyOrNone') {
        return propertyTitle;
    }

    if (mode === 'propertyThenFile') {
        return propertyTitle || file.basename;
    }

    return null;
}; 