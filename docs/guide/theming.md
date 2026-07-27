# 主题与品牌

Yotsuba 提供两层主题能力：使用 `ThemeTokens` 配置跨组件语义，使用 CSS 变量完成宿主页面中的局部覆盖。优先使用令牌；只有在容器级定制时再覆盖变量。

## 通过 ThemeTokens 配置

```vue
<YsSchedule theme="dark" />
<YsSchedule :theme="{ accent: '#176b87', coursePalette: ['#c45858', '#4e79a8'] }" />
```

传入 `Partial<ThemeTokens>` 时，组件会与内置浅色主题合并。课程没有显式 `color` 时，会根据课程名称从 `coursePalette` 中稳定分配颜色。

## 通过 CSS 变量覆盖

组件根节点会注入 `--ys-*` 变量。可以在宿主容器上覆盖这些变量，而不必依赖内部 DOM 结构：

```css
.my-app .ys-schedule {
  --ys-accent: #176b87;
  --ys-canvas: #f7f9fa;
}
```

| 变量 | 语义 |
| --- | --- |
| `--ys-canvas` / `--ys-surface-1/2` | 页面画布与分层表面 |
| `--ys-text-1/2/3` | 主要、次要和辅助文字 |
| `--ys-border` / `--ys-grid-line` | 边框与课表网格线 |
| `--ys-accent` / `--ys-accent-soft` | 品牌强调色及其浅色背景 |
| `--ys-success` / `--ys-warning` / `--ys-danger` | 成功、提醒与危险状态 |

需要替换课程卡、详情字段或 Today 模块结构时，请使用[插槽](/api/slots)，不要通过深层选择器依赖组件内部实现。
