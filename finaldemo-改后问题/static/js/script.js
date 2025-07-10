// 全局变量
let network = null;
let currentTopologyId = null;
let selectedNodeId = null;
let currentQuestionId = null;
let currentQuizSession = null; // 当前问答会话
let topologyResults = {};
let selectedFile = null;
let maxNodes = 0;
let nodeActionModal = null; // 在全局声明节点操作模态框变量
let currentGraphData = null; // 存储当前图谱数据
let currentHistoryId = null; // 新增全局变量来存储历史记录ID

// DOM元素
const fileInput = document.getElementById('fileInput');
const uploadContainer = document.getElementById('uploadContainer');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const progressMessage = document.getElementById('progressMessage');
const graphContainer = document.getElementById('graphContainer');
const networkContainer = document.getElementById('networkContainer');
const nodeCount = document.getElementById('nodeCount');
const edgeCount = document.getElementById('edgeCount');
const quizContainer = document.getElementById('quizContainer');
const questionCard = document.getElementById('questionCard');
const answerFeedback = document.getElementById('answerFeedback');
const noQuestion = document.getElementById('noQuestion');
const currentQuestion = document.getElementById('currentQuestion');
const userAnswer = document.getElementById('userAnswer');
const submitAnswer = document.getElementById('submitAnswer');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackText = document.getElementById('feedbackText');
const feedbackCard = document.getElementById('feedbackCard');
const nextQuestion = document.getElementById('nextQuestion');
const searchNode = document.getElementById('searchNode');
const refreshGraph = document.getElementById('refreshGraph');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const nodeCountInput = document.getElementById('nodeCountInput');
const questionGenerating = document.getElementById('questionGenerating'); // 问题生成提示容器
const historySidebar = document.getElementById('historySidebar'); // 历史记录侧边栏
const historyToggleBtn = document.getElementById('historyToggleBtn'); // 历史记录切换按钮
const historyCloseBtn = document.getElementById('historyCloseBtn'); // 历史记录关闭按钮
const historyList = document.getElementById('historyList'); // 历史记录列表容器

// 对话历史记录
let chatHistory = [];

// 更新节点颜色设置（点亮节点）
function updateNodeColor(node) {
  const style = {
    shape: 'circle',
    size: Math.max(10, node.value * 2),
    font: {
      color: '#ffffff',
      size: 14,
      face: 'Inter'
    }
  };

  // 根据掌握程度设置颜色
  if (node.mastered) {
    style.color = {
      border: '#2ecc71',
      background: '#2ecc71',
      highlight: {
        border: '#27ae60',
        background: '#27ae60'
      }
    };
  } else if (node.mastery_score > 0) {
    style.color = {
      border: '#f39c12',
      background: '#f39c12',
      highlight: {
        border: '#d35400',
        background: '#d35400'
      }
    };
  } else {
    style.color = {
      border: '#e74c3c',
      background: '#e74c3c',
      highlight: {
        border: '#c0392b',
        background: '#c0392b'
      }
    };
  }

  return style;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成，初始化完成'); // 调试信息
  
  // 添加通知样式
  const style = document.createElement('style');
  style.innerHTML = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transform: translateX(120%);
      transition: transform 0.3s ease;
      z-index: 1000;
      width: 350px;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification i {
      font-size: 24px;
    }
    
    .notification.success i {
      color: #2ecc71;
    }
    
    .notification.error i {
      color: #e74c3c;
    }
    
    .notification.info i {
      color: #3498db;
    }
    
    .notification h4 {
      font-size: 16px;
      margin-bottom: 5px;
    }
    
    .notification p {
      font-size: 14px;
      color: #7f8c8d;
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: #95a5a6;
      cursor: pointer;
      margin-left: auto;
      font-size: 16px;
    }
    
    .feedback-box {
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    
    .success {
      background-color: rgba(46, 204, 113, 0.1);
      border-left: 4px solid #2ecc71;
    }
    
    .error {
      background-color: rgba(231, 76, 60, 0.1);
      border-left: 4px solid #e74c3c;
    }
    
    .success-text {
      color: #2ecc71;
    }
    
    .error-text {
      color: #e74c3c;
    }
    
    /* 模态框样式 */
    .nodeActionModal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 10000;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .nodeActionModal.show {
      display: block;
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    
    /* 问答模式样式 */
    .quiz-section {
      margin-top: 40px;
    }
    
    .chat-history {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .chat-message {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 10px;
      position: relative;
    }
    
    .chat-message::before {
      content: "";
      position: absolute;
      width: 8px;
      height: 100%;
      left: 0;
      top: 0;
      border-radius: 8px 0 0 8px;
    }
    
    .user-message {
      background: #f0f7ff;
      margin-left: 30px;
    }
    
    .user-message::before {
      background: #3498db;
    }
    
    .assistant-message {
      background: #f9f9f9;
      margin-right: 30px;
    }
    
    .assistant-message::before {
      background: #95a5a6;
    }
    
    .question-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .question-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .question-header h4 {
      margin: 0;
      font-size: 18px;
      color: #2c3e50;
    }
    
    .question-header i {
      margin-right: 10px;
      font-size: 20px;
      color: #3498db;
    }
    
    .answer-area {
      margin-top: 20px;
    }
    
    .answer-area h4 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #7f8c8d;
    }
    
    /* 问题生成提示样式 */
    #questionGenerating {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      display: none;
    }
    
    .question-generating-notification {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .question-generating-notification i {
      font-size: 24px;
      animation: spin 1s linear infinite;
    }
    
    /* 历史记录消息样式 */
    .history-question {
      border-left: 4px solid #3498db;
      background-color: rgba(52, 152, 219, 0.05);
    }
    
    .history-answer {
      border-left: 4px solid #2ecc71;
      background-color: rgba(46, 204, 113, 0.05);
    }
    
    .history-feedback {
      border-left: 4px solid #f39c12;
      background-color: rgba(243, 156, 18, 0.05);
    }
  `;
  document.head.appendChild(style);
  
  // 获取DOM元素
  const fileStatus = document.getElementById('fileStatus');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  
  // 确保正确获取节点操作模态框元素
  nodeActionModal = document.getElementById('nodeActionModal'); // 节点操作模态框
  const closeNodeActionModal = document.getElementById('closeNodeActionModal');
  const startQuizBtn = document.getElementById('startQuizBtn');
  const deleteNodeBtn = document.getElementById('deleteNodeBtn');

  // 获取历史记录相关元素
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const historyCloseBtn = document.getElementById('historyCloseBtn');
  const historySidebar = document.getElementById('historySidebar');
  const historyList = document.getElementById('historyList');

  // 检查历史记录相关元素
  console.log('历史记录切换按钮:', historyToggleBtn);
  console.log('历史记录关闭按钮:', historyCloseBtn);
  console.log('历史记录侧边栏:', historySidebar);
  console.log('历史记录列表:', historyList);

  // 文件选择事件
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      
      // 显示文件状态
      fileNameDisplay.textContent = selectedFile.name;
      fileStatus.classList.remove('hidden');
      
      // 添加按钮动画效果
      if (generateBtn) generateBtn.classList.add('pulse');
      
      // 添加上传区域高亮效果
      const uploadArea = document.querySelector('.upload-area');
      if (uploadArea) uploadArea.classList.add('file-selected');
      
      // 显示通知
      showNotification('文件已上传', `${selectedFile.name} 准备就绪，点击"开始生成"按钮`, 'success');
    } else {
      // 如果没有选择文件，重置状态
      if (fileStatus) fileStatus.classList.add('hidden');
      if (generateBtn) generateBtn.classList.remove('pulse');
      const uploadArea = document.querySelector('.upload-area');
      if (uploadArea) uploadArea.classList.remove('file-selected');
    }
  });

  // 开始生成按钮事件
  generateBtn.addEventListener('click', () => {
    if (!selectedFile) {
      showNotification('错误', '请先选择文件', 'error');
      return;
    }
    
    // 获取节点数量并验证
    const nodeCountValue = nodeCountInput.value.trim();
    maxNodes = nodeCountValue !== '' ? parseInt(nodeCountValue) : 0;
    
    // 显示进度区域
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (graphContainer) graphContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.add('hidden');
    
    // 重置进度
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (progressMessage) progressMessage.textContent = '准备处理文档...';
    
    // 移除按钮动画
    if (generateBtn) generateBtn.classList.remove('pulse');
    
    // 隐藏文件状态提示
    if (fileStatus) fileStatus.classList.add('hidden');
    
    // 移除上传区域高亮
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) uploadArea.classList.remove('file-selected');
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('max_nodes', maxNodes);  // 添加 max_nodes 参数
    
    // 调用新的API开始生成
    startGeneration(formData);
  });

  // 新的API调用函数
  function startGeneration(formData) {
    fetch('/api/generate', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        currentTopologyId = data.topology_id;
        monitorProgress(currentTopologyId);
      } else {
        showNotification('错误', data.message, 'error');
        resetUpload();
      }
    })
    .catch(error => {
      console.error('生成请求错误:', error);
      showNotification('错误', '请求过程中发生错误，请重试。', 'error');
      resetUpload();
    });
  }

  // 上传文档（保留原有函数，可能在其他地方使用）
  function uploadDocument(file) {
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const allowedExtensions = ['.ppt', '.pptx', '.pdf', '.docx', '.doc', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      showNotification('错误', '不支持的文件类型，请上传PPT、PDF、Word或TXT文件。', 'error');
      return;
    }
    
    // 验证文件大小
    if (file.size > 50 * 1024 * 1024) {
      showNotification('错误', '文件大小超过50MB限制。', 'error');
      return;
    }
    
    // 显示进度区域
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (graphContainer) graphContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.add('hidden');
    
    // 重置进度
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (progressMessage) progressMessage.textContent = '准备上传文档...';
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('file', file);
    
    // 发送请求
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        currentTopologyId = data.topology_id;
        monitorProgress(currentTopologyId);
      } else {
        showNotification('错误', data.message, 'error');
        resetUpload();
      }
    })
    .catch(error => {
      console.error('上传错误:', error);
      showNotification('错误', '上传过程中发生错误，请重试。', 'error');
      resetUpload();
    });
  }

  // 监控处理进度
  function monitorProgress(topology_id) {
    const interval = setInterval(() => {
      fetch(`/api/topology/${topology_id}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'processing') {
            const progress = data.progress || 0;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercentage) progressPercentage.textContent = `${progress}%`;
            if (progressMessage) progressMessage.textContent = data.message || '处理中...';
          } else if (data.status === 'success') {
            clearInterval(interval);
            renderGraph(data.data);
            if (nodeCount) nodeCount.textContent = data.node_count;
            if (edgeCount) edgeCount.textContent = data.edge_count;
            if (progressContainer) progressContainer.classList.add('hidden');
            if (graphContainer) graphContainer.classList.remove('hidden');
            if (quizContainer) quizContainer.classList.remove('hidden');
            if (noQuestion) noQuestion.classList.remove('hidden');
            if (questionCard) questionCard.classList.add('hidden');
            if (answerFeedback) answerFeedback.classList.add('hidden');
          } else if (data.status === 'error') {
            clearInterval(interval);
            showNotification('错误', data.message, 'error');
            resetUpload();
          }
        })
        .catch(error => {
          console.error('获取进度错误:', error);
          clearInterval(interval);
          showNotification('错误', '获取处理进度时发生错误，请重试。', 'error');
          resetUpload();
        });
    }, 1000);
  }

  // 渲染知识图谱
  function renderGraph(graphData) {
    console.log('开始渲染图谱，节点数:', graphData.nodes.length); // 调试信息
    
    // 销毁现有网络
    if (network !== null) {
      network.destroy();
    }
    
    // 创建节点和边
    const nodes = new vis.DataSet(graphData.nodes);
    const edges = new vis.DataSet(graphData.edges);
    
    // 设置节点样式
    nodes.update(graphData.nodes.map(node => {
      return {
        ...node,
        ...updateNodeColor(node)
      };
    }));
    
    // 数据
    const data = {
      nodes: nodes,
      edges: edges
    };
    
    // 配置选项
    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      },
      physics: {
        enabled: false
      },
      nodes: {
        shape: 'circle',
        font: {
          size: 14,
          face: 'Inter'
        }
      },
      edges: {
        color: {
          color: '#95a5a6',
          highlight: '#7f8c8d'
        },
        width: 1,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8
          }
        },
        font: {
          size: 12,
          face: 'Inter',
          align: 'middle'
        }
      }
    };
    
    // 创建网络
    if (networkContainer) {
      network = new vis.Network(networkContainer, data, options);
    } else {
      console.error('网络容器元素未找到');
      return;
    }
    
    // 添加网络渲染完成事件监听
    network.once('afterDrawing', () => {
      console.log('图谱渲染完成');
      
      // 验证特定节点状态
      if (selectedNodeId) {
        const node = nodes.get(selectedNodeId);
        if (node) {
          console.log(`渲染后节点 ${selectedNodeId} 颜色:`, node.color);
        }
      }
    });
    
    // 节点点击事件 - 修复弹窗显示问题
    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        selectedNodeId = params.nodes[0];
        
        // 显示节点操作模态框（修复后的逻辑）
        if (nodeActionModal) {
          // 移除隐藏类并添加显示类
          nodeActionModal.classList.remove('hidden');
          nodeActionModal.classList.add('show');
        }
      }
    });
    
    // 节点悬停事件
    network.on('hoverNode', function(params) {
      const node = nodes.get(params.node);
      network.setOptions({
        nodes: {
          title: `<div class="tooltip"><b>${node.label}</b><br>掌握程度: ${node.mastery_score || 0}/10<br>连续正确: ${node.consecutive_correct}</div>`
        }
      });
    });
    
    // 搜索节点 - 添加空值检查
    if (searchNode) {
      searchNode.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query === '') {
          nodes.update(nodes.get().map(node => ({
            ...node,
            color: {
              ...node.color,
              background: node.color.background,
              border: node.color.border
            }
          })));
          return;
        }
        
        // 高亮匹配的节点
        nodes.update(nodes.get().map(node => {
          if (node.label.toLowerCase().includes(query)) {
            return {
              ...node,
              color: {
                ...node.color,
                background: '#3498db',
                border: '#2980b9'
              }
            };
          }
          return node;
        }));
      });
    } else {
      console.error('搜索节点输入框未找到');
    }
    
    // 刷新图谱 - 添加空值检查
    if (refreshGraph) {
      refreshGraph.addEventListener('click', function() {
        console.log('手动刷新图谱...');
        fetchAndUpdateGraph();
      });
    } else {
      console.error('刷新按钮未找到');
    }
  }

  // 新增：备选的图谱刷新方法
  function fetchAndUpdateGraph() {
    console.log('尝试通过fetchAndUpdateGraph更新图谱...'); // 调试信息
    
    if (!currentTopologyId) {
      console.error('当前拓扑ID不存在');
      return;
    }
    
    fetch(`/api/topology/${currentTopologyId}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          console.log('获取图谱数据成功，节点数:', data.node_count); // 调试信息
          
          // 验证特定节点状态
          const node = data.data.nodes.find(n => n.id === selectedNodeId);
          if (node) {
            console.log(`节点 ${selectedNodeId} 状态:`, node.mastered ? '已掌握' : '未掌握');
          } else {
            console.log(`未找到节点 ${selectedNodeId}`);
          }
          
          renderGraph(data.data);
          if (nodeCount) nodeCount.textContent = data.node_count;
          if (edgeCount) edgeCount.textContent = data.edge_count;
        } else {
          console.error('获取图谱数据失败:', data.message);
          showNotification('错误', '刷新图谱时发生错误，请重试。', 'error');
        }
      })
      .catch(error => {
        console.error('刷新图谱错误:', error);
        showNotification('错误', '刷新图谱时发生错误，请重试。', 'error');
      });
  }

  // 新增：渲染对话历史
  function renderChatHistory() {
    const chatHistoryEl = document.getElementById('chatHistory');
    if (!chatHistoryEl) return;
    
    chatHistoryEl.innerHTML = '';
    
    chatHistory.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message chat-history-message ${msg.type}-message`;
      
      msgDiv.innerHTML = `
        <div class="history-header">
          <strong>${msg.role}</strong>
        </div>
        <div class="history-content">
          <p>${msg.content}</p>
        </div>
        ${msg.feedback ? `<div class="history-feedback">${msg.feedback}</div>` : ''}
      `;
      
      chatHistoryEl.appendChild(msgDiv);
    });
    
    // 滚动到底部
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
  }

  // 新增：添加到对话历史
  function addToHistory(type, content, role = '系统', feedback = '') {
    // 创建唯一的ID确保新问题出现在下方
    const uniqueId = Date.now().toString();
    
    chatHistory.push({
      id: uniqueId,
      type,
      role,
      content,
      feedback
    });
    
    renderChatHistory();
    
    // 滚动到底部
    const chatHistoryEl = document.getElementById('chatHistory');
    if (chatHistoryEl) {
      chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
    }
  }

  // 新增：开始问答会话
  function startQuizSession(nodeId) {
    console.log(`开始节点 ${nodeId} 的问答会话`); // 调试信息
    
    // 清空历史记录
    chatHistory = [];
    addToHistory('system', `已开始关于"${getSelectedNodeLabel(nodeId)}"的问答测试`);
    
    // 重置UI
    if (noQuestion) noQuestion.classList.add('hidden');
    if (questionCard) questionCard.classList.remove('hidden');
    if (answerFeedback) answerFeedback.classList.add('hidden');
    if (userAnswer) userAnswer.value = '';
    
    // 初始化会话
    currentQuizSession = {
      nodeId: nodeId,
      questionsAnswered: 0,
      consecutiveCorrect: 0,
      mastered: false,
      sessionId: null // 会话ID将从API响应中获取
    };
    
    getQuestion(nodeId);
  }
  
  // 新增：获取选中节点的标签
  function getSelectedNodeLabel(nodeId) {
    if (network && network.body && network.body.data) {
      const nodes = network.body.data.nodes;
      const node = nodes.get(nodeId);
      return node ? node.label : '未知节点';
    }
    return '未知节点';
  }

  // 获取问题（更新以支持会话）
  function getQuestion(nodeId) {
    if (!currentTopologyId || !nodeId) return;
    
    if (noQuestion) noQuestion.classList.add('hidden');
    if (questionCard) questionCard.classList.remove('hidden');
    if (answerFeedback) answerFeedback.classList.add('hidden');
    
    // 显示问题生成提示
    if (questionGenerating) {
      questionGenerating.classList.remove('hidden');
    }
    
    // 携带会话ID获取问题
    const sessionParam = currentQuizSession && currentQuizSession.sessionId 
      ? `?session_id=${currentQuizSession.sessionId}` 
      : '';
    
    console.log(`获取节点 ${nodeId} 的问题，会话ID: ${currentQuizSession?.sessionId || '无'}`); // 调试信息
    
    fetch(`/api/topology/${currentTopologyId}/node/${nodeId}/question${sessionParam}`)
      .then(response => response.json())
      .then(data => {
        // 隐藏问题生成提示
        if (questionGenerating) {
          questionGenerating.classList.add('hidden');
        }
        
        if (data.status === 'success') {
          // 处理已掌握的情况
          if (data.mastered) {
            console.log(`节点 ${nodeId} 已掌握`); // 调试信息
            if (noQuestion) noQuestion.classList.remove('hidden');
            if (questionCard) questionCard.classList.add('hidden');
            showNotification('提示', '该知识点已掌握！', 'info');
            currentQuizSession = null;
            return;
          }
          
          if (currentQuestion) currentQuestion.textContent = data.data.question;
          currentQuestionId = data.data.question_id;
          currentQuizSession.sessionId = data.data.session_id; // 保存会话ID
          if (userAnswer) {
            userAnswer.value = '';
            userAnswer.focus();
          }
          
          console.log(`获取问题成功，问题ID: ${currentQuestionId}, 会话ID: ${currentQuizSession.sessionId}`); // 调试信息
        } else {
          console.error('获取问题失败:', data.message); // 调试信息
          showNotification('错误', data.message, 'error');
          if (noQuestion) noQuestion.classList.remove('hidden');
          if (questionCard) questionCard.classList.add('hidden');
          currentQuizSession = null;
        }
      })
      .catch(error => {
        // 隐藏问题生成提示
        if (questionGenerating) {
          questionGenerating.classList.add('hidden');
        }
        
        console.error('获取问题错误:', error);
        showNotification('错误', '获取问题时发生错误，请重试。', 'error');
        if (noQuestion) noQuestion.classList.remove('hidden');
        if (questionCard) questionCard.classList.add('hidden');
        currentQuizSession = null;
      });
  }

  // 提交答案（更新以支持会话和反馈提示）
  submitAnswer.addEventListener('click', function() {
    if (!currentTopologyId || !selectedNodeId || !currentQuestionId || !currentQuizSession) return;
    
    const answer = userAnswer.value.trim();
    if (!answer) {
      showNotification('提示', '请输入你的答案。', 'info');
      return;
    }
    
    // 禁用按钮并显示加载状态
    submitAnswer.disabled = true;
    const submitText = document.getElementById('submitText');
    submitText.innerHTML = '<span class="loading-spinner"></span>正在判断回答...';
    
    // 保存原始文本
    const originalText = submitText.innerHTML;
    
    console.log(`提交问题 ${currentQuestionId} 的答案，节点ID: ${selectedNodeId}, 会话ID: ${currentQuizSession.sessionId}`); // 调试信息
    
    fetch(`/api/topology/${currentTopologyId}/question/${currentQuestionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answer: answer,
        node_id: currentQuizSession.nodeId,
        session_id: currentQuizSession.sessionId
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // 更新会话状态
        currentQuizSession.questionsAnswered++;
        currentQuizSession.consecutiveCorrect = data.data.consecutive_correct;
        currentQuizSession.mastered = data.data.mastered;
        
        console.log(`答案提交成功，是否正确: ${data.data.correct}, 连续正确: ${currentQuizSession.consecutiveCorrect}, 是否已掌握: ${currentQuizSession.mastered}`); // 调试信息
        
        // 显示反馈
        if (feedbackTitle) feedbackTitle.textContent = data.data.correct ? '回答正确!' : '回答错误';
        if (feedbackCard) feedbackCard.className = data.data.correct ? 'feedback-box success' : 'feedback-box error';
        
        // 清空现有反馈内容并添加新内容
        if (feedbackText) {
          feedbackText.innerHTML = '';
          const feedbackParagraph = document.createElement('p');
          feedbackParagraph.textContent = data.data.feedback;
          feedbackText.appendChild(feedbackParagraph);
          
          // 添加下一步提示
          const nextStep = document.createElement('p');
          if (data.data.mastered) {
            nextStep.textContent = '恭喜！你已掌握该知识点！';
            nextStep.className = 'success-text';
          } else if (data.data.next_question) {
            nextStep.textContent = '系统正在准备下一个问题...';
          } else {
            nextStep.textContent = '请完善你的回答并再次提交';
          }
          feedbackText.appendChild(nextStep);
        }
        
        // 添加到历史记录
        addToHistory('question', currentQuestion.textContent, '系统');
        addToHistory('answer', answer, '用户');
        addToHistory('feedback', data.data.feedback, '系统', `正确性: ${data.data.correct ? '✓' : '✗'}`);
        
        // 更新UI
        if (questionCard) questionCard.classList.add('hidden');
        if (answerFeedback) answerFeedback.classList.remove('hidden');
        
        // 如果已掌握，更新图谱并重置会话
        if (data.data.mastered) {
          console.log(`知识点 ${selectedNodeId} 已掌握，准备刷新图谱...`); // 调试信息
          
          const nodes = network.body.data.nodes;
          const node = nodes.get(selectedNodeId);
          if (node) {
              node.mastered = true;
              node.mastery_score = 10; // 满分
              node.consecutive_correct = 3;

              const updatedStyle = updateNodeColor(node);
              nodes.update({
                  id: selectedNodeId,
                  ...updatedStyle
              });
          }
          
          setTimeout(() => {
            if (answerFeedback) answerFeedback.classList.add('hidden');
            if (noQuestion) noQuestion.classList.remove('hidden');
            currentQuizSession = null;
            console.log('问答会话已重置');
          }, 3000);
        } 
        
        // 如果有下一个问题，自动加载
        else if (data.data.next_question) {
          currentQuestionId = data.data.next_question.id;
          if (currentQuestion) currentQuestion.textContent = data.data.next_question.question;
          setTimeout(() => {
            if (answerFeedback) answerFeedback.classList.add('hidden');
            if (questionCard) questionCard.classList.remove('hidden');
            if (userAnswer) {
              userAnswer.value = '';
              userAnswer.focus();
            }
          }, 2000);
        }
      }
    })
    .catch(error => {
      console.error('提交答案错误:', error);
      showNotification('错误', '提交答案时发生错误，请重试。', 'error');
    })
    .finally(() => {
      // 恢复按钮状态
      submitAnswer.disabled = false;
      submitText.innerHTML = '提交答案';
    });
  })

  // 获取下一个问题（保留以备扩展）
  nextQuestion.addEventListener('click', function() {
    if (!currentTopologyId || !selectedNodeId) return;
    
    if (answerFeedback) answerFeedback.classList.add('hidden');
    getQuestion(selectedNodeId);
  });

  // 重新生成按钮事件处理（修复进度条显示）
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', function() {
        if (!currentTopologyId) {
            showNotification('提示', '请先生成知识图谱', 'info');
            return;
        }
        
        // 获取图谱部分的节点数量输入框的值
        const nodeCountValue = document.getElementById('graphNodeCountInput').value.trim();
        const maxNodes = nodeCountValue !== '' ? parseInt(nodeCountValue) : 0;
        
        // 显示进度
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            progressMessage.textContent = '开始重新生成...';
        }
        
        // 模拟进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 500);
        
        // 调用重新生成API，传递新的节点数量
        fetch(`/api/topology/${currentTopologyId}/regenerate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                max_nodes: maxNodes // 传递新的节点数量
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 更新节点和边数量显示
                if (nodeCount) nodeCount.textContent = data.node_count;
                if (edgeCount) edgeCount.textContent = data.edge_count;
                
                // 重新获取图谱数据并渲染
                fetchAndUpdateGraph();
                showNotification('成功', '知识图谱重新生成成功', 'success');
            } else {
                showNotification('错误', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('重新生成图谱错误:', error);
            showNotification('错误', '重新生成图谱时发生错误，请重试。', 'error');
        })
        .finally(() => {
            // 模拟API调用完成后关闭进度条
            setTimeout(() => {
                if (progressContainer) progressContainer.classList.add('hidden');
            }, 3000);
        });
    });
  }
  
  // 节点操作 - 进入问答模式 - 添加空值检查
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function() {
      // 添加淡出动画
      if (nodeActionModal) {
        nodeActionModal.classList.remove('show');
        setTimeout(() => {
          nodeActionModal.classList.add('hidden');
          startQuizSession(selectedNodeId);
        }, 300);
      }
    });
  } else {
    console.error('开始问答按钮未找到');
  }

  // 节点操作 - 删除节点 - 添加空值检查
  if (deleteNodeBtn) {
    deleteNodeBtn.addEventListener('click', function() {
      if (!selectedNodeId) return;
      
      // 添加淡出动画
      if (nodeActionModal) {
        nodeActionModal.classList.remove('show');
        setTimeout(() => {
          nodeActionModal.classList.add('hidden');
          
          // 获取当前网络的数据
          if (network && network.body && network.body.data) {
            const nodes = network.body.data.nodes;
            const edges = network.body.data.edges;
            
            // 1. 找到所有需要删除的节点（选中的节点及其所有子节点）
            const nodesToDelete = new Set();
            nodesToDelete.add(selectedNodeId);
            
            // 递归查找子节点
            function findChildren(nodeId) {
              edges.get().forEach(edge => {
                if (edge.from === nodeId) {
                  nodesToDelete.add(edge.to);
                  findChildren(edge.to);
                }
              });
            }
            findChildren(selectedNodeId);
            
            // 2. 过滤节点和边
            const filteredNodes = nodes.get().filter(node => !nodesToDelete.has(node.id));
            const filteredEdges = edges.get().filter(edge => 
              !nodesToDelete.has(edge.from) && !nodesToDelete.has(edge.to)
            );
            
            // 3. 更新网络
            nodes.clear();
            nodes.add(filteredNodes);
            
            edges.clear();
            edges.add(filteredEdges);
            
            // 更新节点和边计数
            if (nodeCount) nodeCount.textContent = filteredNodes.length;
            if (edgeCount) edgeCount.textContent = filteredEdges.length;
          }
        }, 300);
      }
    });
  } else {
    console.error('删除节点按钮未找到');
  }

  // 关闭节点操作模态框 - 添加空值检查
  if (closeNodeActionModal) {
    closeNodeActionModal.addEventListener('click', function() {
      // 添加淡出动画
      if (nodeActionModal) {
        nodeActionModal.classList.remove('show');
        setTimeout(() => {
          nodeActionModal.classList.add('hidden');
        }, 300);
      }
    });
  } else {
    console.error('关闭模态框按钮未找到');
  }
  
  // 点击模态框背景关闭 - 添加空值检查
  if (nodeActionModal) {
    nodeActionModal.addEventListener('click', function(e) {
      if (e.target === this) { // 点击背景时关闭
        this.classList.remove('show');
        setTimeout(() => {
          this.classList.add('hidden');
        }, 300);
      }
    });
  } else {
    console.error('节点操作模态框未找到');
  }
  
  // 节点数量输入验证 - 添加空值检查
  if (nodeCountInput) {
    nodeCountInput.addEventListener('input', function() {
      // 只允许数字和空值
      this.value = this.value.replace(/[^\d]/g, '');
      // 限制最小值为0
      if (this.value < 0) this.value = 0;
    });
  } else {
    console.error('节点数量输入框未找到');
  }


  const headerNavLinks = document.querySelectorAll('.header-nav a');
  headerNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // 新增：手风琴组件
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.closest('.faq-item');
      faqItem.classList.toggle('active');
    });
  });
  
  // 新增：视图模式切换
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有按钮的活跃状态
      viewButtons.forEach(btn => btn.classList.remove('active'));
      // 添加当前按钮的活跃状态
      this.classList.add('active');
      
      const viewMode = this.getAttribute('data-view');
      updateGraphView(viewMode);
    });
  });
  
  // 新增：掌握程度筛选
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有按钮的活跃状态
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // 添加当前按钮的活跃状态
      this.classList.add('active');
      
      const status = this.getAttribute('data-status');
      filterNodesByStatus(status);
    });
  });
  
  // 新增：节点数量输入框事件
  const graphNodeCountInput = document.getElementById('graphNodeCountInput');
  if (graphNodeCountInput) {
    graphNodeCountInput.addEventListener('change', function() {
      const nodeCount = this.value.trim();
      if (nodeCount && !isNaN(parseInt(nodeCount)) && parseInt(nodeCount) >= 0) {
        regenerateGraphWithNodeCount(parseInt(nodeCount));
      }
    });
  }
  
  // 新增：标记节点掌握状态按钮
  const markNodeBtn = document.getElementById('markNodeBtn');
  if (markNodeBtn) {
    markNodeBtn.addEventListener('click', function() {
      if (!selectedNodeId) return;
      
      // 添加淡出动画
      if (nodeActionModal) {
        nodeActionModal.classList.remove('show');
        setTimeout(() => {
          nodeActionModal.classList.add('hidden');
          markNodeAsMastered(selectedNodeId);
        }, 300);
      }
    });
  }
  
  // 新增：刷新图谱时保留当前选中节点
  const originalRefreshGraph = refreshGraph?.addEventListener;
  if (refreshGraph) {
    refreshGraph.addEventListener('click', function() {
      const originalSelectedNode = selectedNodeId;
      originalRefreshGraph.call(this, 'click', function() {
        // 刷新后重新选中节点
        if (originalSelectedNode && network) {
          network.selectNodes([originalSelectedNode]);
        }
      });
    });
  }

  // 初始化事件监听器
  console.log('初始化事件监听器');
  initEventListeners();
  
  // 加载历史记录列表
  console.log('加载历史记录列表');
  loadHistoryList();
});

// 初始化事件监听器
function initEventListeners() {
  // 现有事件监听器...
  
  // 历史记录相关事件监听器
  if (historyToggleBtn) {
    historyToggleBtn.addEventListener('click', function() {
      console.log('点击了历史记录切换按钮');
      if (historySidebar) {
        historySidebar.classList.toggle('open');
      }
    });
  } else {
    console.error('历史记录切换按钮未找到');
  }
  
  if (historyCloseBtn) {
    historyCloseBtn.addEventListener('click', function() {
      console.log('点击了历史记录关闭按钮');
      if (historySidebar) {
        historySidebar.classList.remove('open');
      }
    });
  } else {
    console.error('历史记录关闭按钮未找到');
  }
}

// 加载历史记录列表 - 将嵌套函数移到全局
function loadHistoryList() {
  console.log('加载历史记录列表');
  if (!historyList) {
    console.error('历史记录列表元素未找到');
    return;
  }

  fetch('/api/history/list')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.history_records && data.history_records.length > 0) {
        // 清空现有内容
        historyList.innerHTML = '';
        
        // 添加历史记录项
        data.history_records.forEach(record => {
          const historyItem = document.createElement('div');
          historyItem.className = 'history-item';
          historyItem.dataset.id = record.id;
          historyItem.innerHTML = `
            <div class="history-item-title">${record.title}</div>
            <div class="history-item-date">${record.created_at}</div>
          `;
          
          // 点击加载历史记录
          historyItem.addEventListener('click', () => {
            loadHistoryGraph(record.id, historySidebar);
          });
          
          historyList.appendChild(historyItem);
        });
      } else {
        // 显示空状态
        historyList.innerHTML = `
          <div class="history-empty">
            <i class="fas fa-info-circle"></i>
            <p>暂无历史记录</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('加载历史记录失败:', error);
      showNotification('错误', '加载历史记录失败，请重试', 'error');
    });
}

// 加载历史图谱函数 - 将嵌套函数移到全局
function loadHistoryGraph(historyId, sidebar) {
  showNotification('加载中', '正在加载历史知识图谱...', 'info');
  
  fetch(`/api/history/${historyId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.history_record) {
        // 关闭侧边栏
        if (sidebar) {
          sidebar.classList.remove('open');
        }
        
        // 显示图谱容器
        if (graphContainer) {
          graphContainer.classList.remove('hidden');
        }
        
        // 渲染历史图谱
        renderHistoryGraph(data.history_record.content, historyId);
        
        showNotification('成功', '历史知识图谱加载成功', 'success');
      } else {
        showNotification('错误', '加载历史知识图谱失败', 'error');
      }
    })
    .catch(error => {
      console.error('加载历史图谱失败:', error);
      showNotification('错误', '加载历史图谱失败，请重试', 'error');
    });
}

// 渲染历史图谱
function renderHistoryGraph(graphData, historyId = null) {
    console.log('渲染历史图谱:', historyId);
    console.log('图谱数据:', graphData);
    
    // 保存历史ID
    if (historyId) {
        currentHistoryId = historyId;
        console.log('设置当前历史ID:', currentHistoryId);
    }
    
    // 保存图谱数据
    currentGraphData = graphData;
    
    try {
        // 检查数据格式
        if (!graphData) {
            throw new Error('图谱数据为空');
        }
        
        // 处理不同格式的图谱数据
        let nodes = [];
        let edges = [];
        
        // 检查数据格式
        if (Array.isArray(graphData)) {
            // 旧格式：数组形式
            console.log('处理旧格式数据（数组）');
            
            // 提取节点和边
            const nodeMap = new Map();
            
            graphData.forEach(item => {
                // 处理源节点
                if (item.source && !nodeMap.has(item.source)) {
                    nodeMap.set(item.source, {
                        id: item.source,
                        label: item.source,
                        mastered: item.highlighted || false,
                        highlighted: item.highlighted || false,
                        value: 5
                    });
                } else if (nodeMap.has(item.source) && item.highlighted) {
                    // 更新节点状态
                    const node = nodeMap.get(item.source);
                    node.highlighted = true;
                    node.mastered = true;
                    nodeMap.set(item.source, node);
                }
                
                // 处理目标节点
                if (item.target && !nodeMap.has(item.target)) {
                    nodeMap.set(item.target, {
                        id: item.target,
                        label: item.target,
                        mastered: item.highlighted || false,
                        highlighted: item.highlighted || false,
                        value: 5
                    });
                } else if (nodeMap.has(item.target) && item.highlighted) {
                    // 更新节点状态
                    const node = nodeMap.get(item.target);
                    node.highlighted = true;
                    node.mastered = true;
                    nodeMap.set(item.target, node);
                }
                
                // 添加边
                if (item.source && item.target) {
                    edges.push({
                        from: item.source,
                        to: item.target,
                        label: item.relation || '',
                        arrows: 'to'
                    });
                }
            });
            
            // 转换节点Map为数组
            nodes = Array.from(nodeMap.values());
            
            // 更新当前图谱数据为标准格式
            currentGraphData = { nodes, edges };
        } else if (graphData.nodes && graphData.edges) {
            // 新格式：对象形式，包含nodes和edges属性
            console.log('处理新格式数据（对象）');
            
            // 确保节点有正确的格式
            nodes = graphData.nodes.map(node => ({
                id: node.id,
                label: node.label || node.id,
                level: node.level || 0,
                value: node.value || 5,
                mastered: node.mastered || node.highlighted || false,
                highlighted: node.highlighted || node.mastered || false,
                mastery_score: node.mastery_score || 0,
                consecutive_correct: node.consecutive_correct || 0,
                content_snippet: node.content_snippet || ''
            }));
            
            // 确保边有正确的格式
            edges = graphData.edges.map(edge => ({
                from: edge.from || edge.from_node,
                to: edge.to || edge.to_node,
                label: edge.label || '',
                arrows: edge.arrows || 'to'
            }));
        } else {
            throw new Error('无法识别的图谱数据格式');
        }
        
        // 显示图谱容器
        const graphContainer = document.getElementById('graphContainer');
        if (graphContainer) {
            graphContainer.classList.remove('hidden');
        }
        
        // 更新节点和边的计数
        const nodeCountElement = document.getElementById('nodeCount');
        const edgeCountElement = document.getElementById('edgeCount');
        if (nodeCountElement) nodeCountElement.textContent = nodes.length;
        if (edgeCountElement) edgeCountElement.textContent = edges.length;
        
        // 创建vis.js数据集 - 使用与renderGraph相同的方式
        const nodesDataset = new vis.DataSet(nodes);
        const edgesDataset = new vis.DataSet(edges);
        
        // 设置节点样式 - 与renderGraph保持完全一致
        nodesDataset.update(nodes.map(node => {
            return {
                ...node,
                ...updateNodeColor(node)
            };
        }));
        
        // 创建网络图
        const networkContainer = document.getElementById('networkContainer');
        if (!networkContainer) {
            throw new Error('网络图容器不存在');
        }
        
        // 数据 - 与renderGraph保持一致的格式
        const data = {
            nodes: nodesDataset,
            edges: edgesDataset
        };
        
        // 设置网络图选项 - 使用与renderGraph相同的配置
        const options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    nodeSpacing: 150,
                    levelSeparation: 200
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            },
            physics: {
                enabled: false
            },
            nodes: {
                shape: 'circle',
                font: {
                    size: 14,
                    face: 'Inter'
                }
            },
            edges: {
                color: {
                    color: '#95a5a6',
                    highlight: '#7f8c8d'
                },
                width: 1,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.8
                    }
                },
                font: {
                    size: 12,
                    face: 'Inter',
                    align: 'middle'
                }
            }
        };
        
        // 创建网络图实例 - 使用与renderGraph相同的方式
        network = new vis.Network(networkContainer, data, options);
        
        // 添加网络渲染完成事件监听 - 与renderGraph保持一致
        network.once('afterDrawing', () => {
            console.log('历史图谱渲染完成');
            
            // 验证特定节点状态
            if (selectedNodeId) {
                const node = nodesDataset.get(selectedNodeId);
                if (node) {
                    console.log(`渲染后节点 ${selectedNodeId} 颜色:`, node.color);
                }
            }
        });
        
        // 添加节点点击事件 - 与renderGraph保持一致
        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                selectedNodeId = params.nodes[0];
                
                // 显示节点操作模态框（修复后的逻辑）
                if (nodeActionModal) {
                    // 移除隐藏类并添加显示类
                    nodeActionModal.classList.remove('hidden');
                    nodeActionModal.classList.add('show');
                }
            }
        });

        // 添加节点悬停事件 - 与renderGraph保持一致
        network.on('hoverNode', function(params) {
            const node = nodesDataset.get(params.node);
            network.setOptions({
                nodes: {
                    title: `<div class="tooltip"><b>${node.label}</b><br>掌握程度: ${node.mastery_score || 0}/10<br>连续正确: ${node.consecutive_correct}</div>`
                }
            });
        });
        
        console.log('历史图谱渲染完成');
        
        // 显示成功通知
        if (typeof showNotification === 'function') {
            showNotification('成功', '历史知识图谱已加载', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('渲染历史图谱失败:', error);
        
        // 显示错误通知
        if (typeof showNotification === 'function') {
            showNotification('错误', '渲染历史图谱失败: ' + error.message, 'error');
        }
        
        return false;
    }
}

// 将 renderHistoryGraph 函数声明为全局函数
window.renderHistoryGraph = renderHistoryGraph;

// 保存历史记录
function saveHistoryRecord(graphData, historyId = null) {
    console.log('保存历史记录:', historyId ? '更新现有记录' : '创建新记录');
    
    // 准备要保存的数据
    const data = {
        content: graphData,
        title: `知识图谱 ${new Date().toLocaleString()}`,
        description: '用户保存的知识图谱'
    };
    
    // 如果是更新现有记录，添加历史ID
    if (historyId) {
        data.history_id = historyId;
    }
    
    // 添加用户ID（如果有）
    const userId = localStorage.getItem('user_id');
    if (userId) {
        data.user_id = userId;
    }
    
    // 显示保存中提示
    if (typeof showNotification === 'function') {
        showNotification('保存中', '正在保存知识图谱...', 'info');
    }
    
    // 发送保存请求
    fetch('/api/history/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('保存历史记录API响应状态:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log('保存历史记录响应:', result);
        
        if (result.success) {
            // 保存新的历史ID
            window.currentHistoryId = result.history_id;
            
            // 如果API返回了用户ID，保存到本地存储
            if (result.user_id) {
                localStorage.setItem('user_id', result.user_id);
            }
            
            // 显示成功提示
            if (typeof showNotification === 'function') {
                showNotification('成功', '知识图谱已保存到历史记录', 'success');
            }
            
            // 刷新历史记录列表
            if (typeof window.loadHistoryList === 'function') {
                window.loadHistoryList();
            }
        } else {
            console.error('保存历史记录失败:', result.message);
            if (typeof showNotification === 'function') {
                showNotification('错误', result.message || '保存历史记录失败', 'error');
            }
        }
    })
    .catch(error => {
        console.error('保存历史记录请求失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('错误', '保存历史记录请求失败: ' + error.message, 'error');
        }
    });
}

// 更新节点点亮状态
function updateNodeHighlightStatus(nodeId, highlighted) {
    console.log(`更新节点 ${nodeId} 的点亮状态为 ${highlighted}`);
    
    // 如果没有当前图谱数据，则无法更新
    if (!currentGraphData) {
        console.error('没有当前图谱数据，无法更新节点状态');
        if (typeof showNotification === 'function') {
            showNotification('错误', '没有当前图谱数据，无法更新节点状态', 'error');
        }
        return;
    }
    
    // 查找节点并更新状态
    const nodeIndex = currentGraphData.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
        console.error(`未找到节点 ${nodeId}`);
        return;
    }
    
    // 更新节点状态
    currentGraphData.nodes[nodeIndex].mastered = highlighted;
    currentGraphData.nodes[nodeIndex].highlighted = highlighted;
    
    // 更新可视化
    if (network) {
        network.body.data.nodes.update({
            id: nodeId,
            mastered: highlighted,
            highlighted: highlighted,
            color: highlighted ? 
                { background: '#4CAF50', border: '#388E3C' } : 
                { background: '#FF9800', border: '#F57C00' }
        });
    }
    
    // 保存到历史记录
    console.log('节点状态已更改，准备保存到历史记录');
    
    // 准备文件名（用于API响应文件）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
    const fileName = `api_response_${timestamp}.txt`;
    
    // 构建保存数据
    const saveData = {
        graph_data: currentGraphData,
        node_id: nodeId,
        highlighted: highlighted,
        title: `知识图谱 ${new Date().toLocaleString()}`,
        history_id: currentHistoryId // 使用当前历史ID（如果有）
    };
    
    // 发送保存请求
    fetch('/api/save_node_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
    })
    .then(response => {
        console.log('保存节点状态API响应状态:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('节点状态保存成功:', data);
            
            // 更新当前历史ID
            if (data.history_id) {
                currentHistoryId = data.history_id;
                console.log('更新当前历史ID:', currentHistoryId);
            }
            
            // 显示成功通知
            if (typeof showNotification === 'function') {
                showNotification('成功', '节点状态已更新并保存', 'success');
            }
            
            // 刷新历史记录列表
            if (typeof window.loadHistoryList === 'function') {
                window.loadHistoryList();
            }
        } else {
            console.error('保存节点状态失败:', data.message);
            if (typeof showNotification === 'function') {
                showNotification('错误', data.message || '保存节点状态失败', 'error');
            }
        }
    })
    .catch(error => {
        console.error('保存节点状态请求失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('错误', '保存节点状态失败: ' + error.message, 'error');
        }
    });
}

// 更新图谱视图模式
function updateGraphView(viewMode) {
  if (!network) return;
  
  let options = network.options;
  options.layout = {};
  
  switch(viewMode) {
    case 'force':
      options.layout.force = {};
      options.physics.enabled = true;
      break;
    case 'hierarchical':
      options.layout.hierarchical = {
        enabled: true,
        direction: 'UD',
        sortMethod: 'directed',
        nodeSpacing: 150,
        levelSeparation: 200
      };
      options.physics.enabled = false;
      break;
    case 'circular':
      options.layout.circular = {
        enabled: true
      };
      options.physics.enabled = false;
      break;
  }
  
  network.setOptions(options);
}

// 按掌握程度筛选节点
function filterNodesByStatus(status) {
  if (!network) return;
  
  const nodes = network.body.data.nodes;
  const edges = network.body.data.edges;
  
  nodes.forEach(node => {
    let shouldShow = true;
    
    if (status !== 'all') {
      if (status === 'mastered' && !node.mastered) shouldShow = false;
      if (status === 'partial' && (node.mastered || node.mastery_score === 0)) shouldShow = false;
      if (status === 'unmastered' && node.mastery_score > 0) shouldShow = false;
    }
    
    node.hidden = !shouldShow;
  });
  
  edges.forEach(edge => {
    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);
    
    edge.hidden = fromNode.hidden || toNode.hidden;
  });
  
  network.redraw();
}

// 使用指定节点数量重新生成图谱
function regenerateGraphWithNodeCount(nodeCount) {
  if (!currentTopologyId) return;
  
  showNotification('提示', `正在使用${nodeCount}个节点重新生成图谱...`, 'info');
  
  fetch(`/api/topology/${currentTopologyId}/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      max_nodes: nodeCount
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        renderGraph(data.data);
        if (nodeCount) nodeCount.textContent = data.node_count;
        if (edgeCount) edgeCount.textContent = data.edge_count;
        showNotification('成功', '知识图谱已重新生成', 'success');
      } else {
        showNotification('错误', data.message, 'error');
      }
    })
    .catch(error => {
      console.error('重新生成图谱错误:', error);
      showNotification('错误', '重新生成图谱时发生错误，请重试。', 'error');
    });
}

// 标记节点为已掌握
function markNodeAsMastered(nodeId) {
  if (!network || !nodeId) return;
  
  const nodes = network.body.data.nodes;
  const node = nodes.get(nodeId);
  
  if (node) {
    node.mastered = true;
    node.mastery_score = 10;
    node.consecutive_correct = 3;
    
    const updatedStyle = updateNodeColor(node);
    nodes.update({
      id: nodeId,
      ...updatedStyle
    });
    
    showNotification('成功', `已将"${node.label}"标记为已掌握`, 'success');
  }
}

// 在全局添加关闭模态框的事件
document.addEventListener('click', function(e) {
  // 点击背景关闭模态框
  if (nodeActionModal && !nodeActionModal.classList.contains('hidden') && 
      e.target === nodeActionModal) {
    nodeActionModal.classList.remove('show');
    setTimeout(() => {
      nodeActionModal.classList.add('hidden');
    }, 300);
  }
});

// 重置上传区域
function resetUpload() {
  console.log('重置上传区域和会话状态'); // 调试信息
  
  if (progressContainer) progressContainer.classList.add('hidden');
  if (graphContainer) graphContainer.classList.add('hidden');
  if (quizContainer) quizContainer.classList.add('hidden');
  if (fileInput) fileInput.value = '';
  selectedFile = null;
  currentQuizSession = null; // 重置会话
}

// 显示通知
function showNotification(title, message, type = 'info') {
  console.log(`通知: ${title} - ${message} (${type})`);
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
    <button class="notification-close">&times;</button>
  `;
  
  // 添加到页面
  const notificationContainer = document.getElementById('notificationContainer');
  if (!notificationContainer) {
    // 如果容器不存在，创建一个
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    container.appendChild(notification);
  } else {
    notificationContainer.appendChild(notification);
  }
  
  // 关闭按钮点击事件
  const closeButton = notification.querySelector('.notification-close');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      notification.remove();
    });
  }
  
  // 自动关闭
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 500);
    }
  }, 3000);
}