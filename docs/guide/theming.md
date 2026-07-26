# 主题定制

两层定制体系:

## 1. ThemeTokens(JS 层)

```vue
<YsSchedule theme="dark" />
<YsSchedule :theme="{ accent: '#7c5cd6', coursePalette: ['#d1477a', '#5a68d8'] }" />
```

传入 `Partial<ThemeTokens>` 时与内置 light 主题合并。课程未指定 `color` 时,按课程名从 `coursePalette` 稳定分配(同名课永远同色)。

## 2. CSS 变量(样式层)

组件根节点注入 `--ys-*` 变量,可在任意选择器覆盖:

```css
.my-app .ys-schedule {
  --ys-accent: #7c5cd6;
  --ys-canvas: #faf9f6;
}
```

| 变量 | 语义 |
| --- | --- |
| `--ys-canvas` / `--ys-surface-1/2` | 画布 / 表面 |
| `--ys-text-1/2/3` | 文字三级 |
| `--ys-border` / `--ys-grid-line` | 边框 / 格线 |
| `--ys-accent` / `--ys-accent-soft` | 主色 / 主色底 |
| `--ys-success` / `--ys-warning` / `--ys-danger` | 语义色 |
