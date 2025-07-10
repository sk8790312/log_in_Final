// 历史记录功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('历史记录模块初始化');
    
    // 获取DOM元素
    const historyToggleBtn = document.getElementById('historyToggleBtn');
    const historyCloseBtn = document.getElementById('historyCloseBtn');
    const historySidebar = document.getElementById('historySidebar');
    const historyList = document.getElementById('historyList');
    
    // 检查元素是否存在
    console.log('历史记录按钮:', historyToggleBtn);
    console.log('历史记录侧边栏:', historySidebar);
    console.log('历史记录列表:', historyList);
    
    // 历史记录按钮点击事件
    if (historyToggleBtn) {
        historyToggleBtn.addEventListener('click', function() {
            console.log('点击了历史记录按钮');
            if (historySidebar) {
                historySidebar.classList.toggle('open');
                console.log('侧边栏状态:', historySidebar.classList.contains('open') ? '已打开' : '已关闭');
                
                // 如果侧边栏打开，则重新加载历史记录列表
                if (historySidebar.classList.contains('open')) {
                    window.loadHistoryList();
                }
            }
        });
    }
    
    // 关闭按钮点击事件
    if (historyCloseBtn) {
        historyCloseBtn.addEventListener('click', function() {
            console.log('点击了关闭按钮');
            if (historySidebar) {
                historySidebar.classList.remove('open');
            }
        });
    }
    
    // 加载历史记录列表
    window.loadHistoryList = function() {
        console.log('开始加载历史记录列表');
        
        // 获取历史记录列表元素
        const historyListElement = document.getElementById('historyList');
        if (!historyListElement) {
            console.error('历史记录列表元素未找到');
            return;
        }
        
        // 显示加载中状态
        historyListElement.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-spinner fa-spin"></i>
                <p>正在加载历史记录...</p>
            </div>
        `;
        
        // 添加当前时间戳以避免缓存问题
        const timestamp = new Date().getTime();
        
        fetch(`/api/history/list?t=${timestamp}`)
            .then(response => {
                console.log('历史记录API响应状态:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('历史记录数据:', data);
                if (data.success && data.history_records && data.history_records.length > 0) {
                    // 清空现有内容
                    historyListElement.innerHTML = '';
                    
                    // 添加历史记录项
                    data.history_records.forEach(record => {
                        console.log('处理历史记录项:', record);
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        historyItem.dataset.id = record.id;
                        
                        // 添加删除按钮
                        historyItem.innerHTML = `
                            <div class="history-item-content">
                                <div class="history-item-title">${record.title || '未命名知识图谱'}</div>
                                <div class="history-item-date">${record.created_at || '未知时间'}</div>
                            </div>
                            <button class="history-item-delete" title="删除此历史记录">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        
                        // 点击加载历史记录
                        const contentDiv = historyItem.querySelector('.history-item-content');
                        contentDiv.addEventListener('click', function() {
                            console.log('点击了历史记录项:', record.id);
                            loadHistoryGraph(record.id);
                        });
                        
                        // 点击删除按钮
                        const deleteBtn = historyItem.querySelector('.history-item-delete');
                        deleteBtn.addEventListener('click', function(e) {
                            e.stopPropagation(); // 阻止事件冒泡
                            console.log('点击了删除按钮:', record.id);
                            deleteHistoryRecord(record.id);
                        });

                        historyListElement.appendChild(historyItem);
                    });
                    
                    console.log(`成功加载${data.history_records.length}条历史记录`);
                } else {
                    // 显示空状态
                    historyListElement.innerHTML = `
                        <div class="history-empty">
                            <i class="fas fa-info-circle"></i>
                            <p>暂无历史记录</p>
                            <p class="history-empty-tip">生成知识图谱后会自动保存到历史记录</p>
                        </div>
                    `;
                    console.log('没有历史记录或API返回错误');
                }
            })
            .catch(error => {
                console.error('加载历史记录失败:', error);
                historyListElement.innerHTML = `
                    <div class="history-empty">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>加载历史记录失败，请重试</p>
                        <p class="history-empty-tip">错误信息: ${error.message}</p>
                    </div>
                `;
            });
    };
    
    // 全局函数：加载历史图谱
    window.loadHistoryGraph = function(historyId) {
        console.log('加载历史图谱:', historyId);
        
        // 显示加载提示
        if (typeof showNotification === 'function') {
            showNotification('加载中', '正在加载历史知识图谱...', 'info');
        }
        
        fetch(`/api/history/${historyId}`)
            .then(response => {
                console.log('历史图谱API响应状态:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('历史图谱数据:', data);
                if (data.success && data.history_record) {
                    // 关闭侧边栏
                    if (historySidebar) {
                        historySidebar.classList.remove('open');
                    }
                    
                    // 显示图谱容器
                    const graphContainer = document.getElementById('graphContainer');
                    if (graphContainer) {
                        graphContainer.classList.remove('hidden');
                    }
                    
                    // 获取历史记录内容
                    let graphContent = null;
                    
                    // 检查是否有文件路径
                    if (data.history_record.file_path) {
                        console.log('历史记录文件路径:', data.history_record.file_path);
                    }
                    
                    // 使用内容数据
                    if (data.history_record.content) {
                        graphContent = data.history_record.content;
                        console.log('使用内存中的数据加载图谱');
                    } else {
                        console.error('历史记录内容为空');
                        if (typeof showNotification === 'function') {
                            showNotification('错误', '历史记录内容为空，无法加载图谱', 'error');
                        }
                        return;
                    }
                    
                    // 保存当前历史ID
                    window.currentHistoryId = historyId;
                    
                    // 渲染历史图谱，传递历史记录ID
                    if (typeof window.renderHistoryGraph === 'function') {
                        window.renderHistoryGraph(graphContent, historyId);
                    } else {
                        console.error('renderHistoryGraph函数未定义');
                        if (typeof showNotification === 'function') {
                            showNotification('错误', 'renderHistoryGraph函数未定义，无法渲染图谱', 'error');
                        }
                    }
                    
                    if (typeof showNotification === 'function') {
                        showNotification('成功', '历史知识图谱加载成功', 'success');
                    }
                } else {
                    console.error('加载历史图谱失败:', data.message || '未知错误');
                    if (typeof showNotification === 'function') {
                        showNotification('错误', data.message || '加载历史知识图谱失败', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('加载历史图谱失败:', error);
                if (typeof showNotification === 'function') {
                    showNotification('错误', '加载历史图谱失败: ' + error.message, 'error');
                }
            });
    };
    
    // 删除历史记录
    window.deleteHistoryRecord = function(historyId) {
        if (!confirm('确定要删除此历史记录吗？此操作不可恢复。')) {
            return;
        }
        
        console.log('删除历史记录:', historyId);
        
        fetch(`/api/history/${historyId}/delete`, {
            method: 'POST'
        })
        .then(response => {
            console.log('删除历史记录API响应状态:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('删除历史记录响应:', data);
            if (data.success) {
                // 显示成功通知
                if (typeof showNotification === 'function') {
                    showNotification('成功', '历史记录已删除', 'success');
                }
                
                // 重新加载历史记录列表
                window.loadHistoryList();
            } else {
                if (typeof showNotification === 'function') {
                    showNotification('错误', data.message || '删除历史记录失败', 'error');
                }
            }
        })
        .catch(error => {
            console.error('删除历史记录请求失败:', error);
            if (typeof showNotification === 'function') {
                showNotification('错误', '删除历史记录请求失败', 'error');
            }
        });
    };
    
    // 初始加载历史记录列表
    window.loadHistoryList();
}); 