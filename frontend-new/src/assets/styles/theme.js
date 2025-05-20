// theme.js
const theme = {
    token: {
        colorPrimary: '#0cb5fb', // 主题色
        borderRadius: 1.5,         // 组件圆角
    },
    components: {
        Button: {
            colorPrimary: '#1c324a', // 普通按钮主题色
        },
        Layout: {
            headerBg: '#1c324a', // 设置 Header 的背景色为 #1c324a
            headerColor: '#ffffff', // 设置 Header 内文本颜色为白色
            backgroundColor: '#ffffff', // 设置 Layout 的背景色为白色
        },
        Menu: {
            darkItemBg: '#1c324a',
            horizontalItemSelectedBg: '#0cb5fb',
            itemSelectedColor: '#ffffff',
            itemColor: '#ffffff',
            colorText: 'rgba(0, 0, 0, 0.88)',
            activeBarBorderWidth: 0,
        },
    },
};

export default theme;
