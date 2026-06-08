# AI HOT

一个基于 [AI HOT](https://aihot.virxact.com) 公开 API 的中文 AI 精选资讯网站。

## 功能

- 默认读取最近 24 小时精选条目
- 支持 24 小时、3 天、7 天窗口
- 支持模型、产品、行业、论文、技巧与观点分类
- 支持标题、摘要和来源搜索
- API 不可用时明确提示，不使用静态旧新闻冒充实时数据
- 纯静态 HTML/CSS/JavaScript，可直接部署到 GitHub Pages

## 本地运行

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 数据源

```text
https://aihot.virxact.com/api/public/items?mode=selected
```

新闻版权归原作者与来源网站所有。
