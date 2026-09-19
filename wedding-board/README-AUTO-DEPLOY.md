# Cursor → Cloudflare 自动发布（一次配置）

目标：之后只在 Cursor 里改 `wedding-board/`，`git push` 后网站自动更新，**不必再手工上传**。

## 1. 创建 Cloudflare API Token（不要用登录密码）

1. 打开 https://dash.cloudflare.com/profile/api-tokens  
2. **Create Token** → 使用模板 **Edit Cloudflare Workers**  
   或自定义权限至少包含：
   - Account → Cloudflare Pages → Edit  
   - Account → Account Settings → Read（部分账号需要）  
3. 账户资源选你的账号 → Continue → Create Token  
4. **复制 Token，只显示一次**

同时记下 **Account ID**：Cloudflare 首页右侧或 Workers & Pages 概览里的 Account ID。

## 2. 写入 GitHub Secrets

在本仓库 GitHub 页面：

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | 上一步的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Account ID |

## 3. 首次手动跑一次（可选）

GitHub → **Actions** → **Deploy wedding board to Cloudflare Pages** → **Run workflow**

或把本 PR 合入 `master` 后，再改一点 `wedding-board/` 并 push，会自动部署。

## 4. 之后日常流程（全在 Cursor）

1. 在 Cursor 改 `wedding-board/index.html`（或让 Agent 改）  
2. Agent / 你执行 commit + push 到 `master`  
3. Actions 绿灯后，打开 `https://wedding-liyuan-board.pages.dev` 刷新即可  

无需再进 Cloudflare 拖文件。

## 5. 安全提醒

- 已在聊天里发过的密码请尽快修改  
- Token 可设过期时间；泄露后在 Cloudflare 里 Roll  
- 看板通话笔记在浏览者 localStorage，不会因部署而上传；不要把含隐私的导出 JSON 提交进仓库
