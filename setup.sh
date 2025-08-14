#!/bin/bash

echo "🚀 Nexus of Notions (NoN) 设置脚本"
echo "=================================="

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+ 版本"
    exit 1
fi

echo "✅ Node.js 版本检查通过"

# 删除 node_modules 目录 和 .nuxt 目录
echo "🔄 清理项目目录..."
rm -rf node_modules
rm -rf .nuxt

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 检查环境变量文件
echo "🔧 检查环境变量配置..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo "📝 创建 .env 文件..."
        cp env.example .env
        echo "⚠️  请编辑 .env 文件，配置你的数据库连接信息"
    else
        echo "❌ 未找到环境变量示例文件"
        exit 1
    fi
else
    echo "✅ .env 文件已存在"
fi

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
pnpm run db:generate

echo ""
echo "🎉 设置完成！"
echo ""
echo "📋 下一步："
echo "1. 编辑 .env 文件，配置数据库连接信息（如果还没配置）"
echo "2. 运行 'npm run dev' 启动开发服务器"
echo "3. 访问 http://localhost:3000 查看应用"
echo ""
echo "📚 更多信息请查看 README.md"
