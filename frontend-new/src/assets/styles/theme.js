/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
