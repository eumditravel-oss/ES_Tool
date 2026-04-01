const STORAGE_KEY = 'ES_ADJUSTMENT_WEBAPP_V3';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const SAMPLE_STATE = {
  meta: {
    agency: '',
    projectName: '',
    bidDate: '',
    contractDate: '',
    compareDate: '',
    memo: ''
  },
  groups: [
    {
      id: uid(),
      name: '직접공사비',
      items: [
        { id: uid(), name: '노무비', cost: 0, baseIndex: 100, compareIndex: 102.29, note: '' },
        { id: uid(), name: '재료비', cost: 0, baseIndex: 100, compareIndex: 103.58, note: '' },
        { id: uid(), name: '경비', cost: 0, baseIndex: 121.93, compareIndex: 123.39, note: '' }
      ]
    },
    {
      id: uid(),
      name: '제요율경비',
      items: [
        { id: uid(), name: '산재보험료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '산업안전보건관리비', cost: 0, baseIndex: 100, compareIndex: 101.89, note: '' },
        { id: uid(), name: '고용보험료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '건설근로자 퇴직공제부금비', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '국민건강보험료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '국민연금보험료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '노인장기요양보험료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '건설기계대여금 지급보증서 발급수수료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '하도급대금 지급보증서 발급수수료', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' },
        { id: uid(), name: '환경보전비', cost: 0, baseIndex: 100, compareIndex: 102.28, note: '' }
      ]
    }
  ]
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  agency: $('#agency'),
  projectName: $('#projectName'),
  bidDate: $('#bidDate'),
  contractDate: $('#contractDate'),
  compareDate: $('#compareDate'),
  memo: $('#memo'),
  tableBody: $('#tableBody'),
  kpiTotalCost: $('#kpiTotalCost'),
  kpiCoefficient: $('#kpiCoefficient'),
  kpiES: $('#kpiES'),
  kpiStatus: $('#kpiStatus'),
  tfootTotalCost: $('#tfootTotalCost'),
  tfootCoefficient: $('#tfootCoefficient'),
  tfootES: $('#tfootES'),
  summaryAgency: $('#summaryAgency'),
  summaryProject: $('#summaryProject'),
  summaryCompareDate: $('#summaryCompareDate'),
  statusBox: $('#statusBox'),
  saveBtn: $('#saveBtn'),
  printBtn: $('#printBtn'),
  loadSampleBtn: $('#loadSampleBtn'),
  addGroupBtn: $('#addGroupBtn'),
  addItemBtn: $('#addItemBtn'),
  validateBtn: $('#validateBtn'),
  exportBtn: $('#exportBtn'),
  importInput: $('#importInput'),
  resetBtn: $('#resetBtn'),
  toastHost: $('#toastHost'),
  modalBackdrop: $('#modalBackdrop'),
  modalTitle: $('#modalTitle'),
  modalBody: $('#modalBody'),
  modalClose: $('#modalClose'),
  modalOk: $('#modalOk')
};

init();

function init() {
  bindMeta();
  bindActions();
  bindSideMenu();
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(SAMPLE_STATE);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.groups)) return clone(SAMPLE_STATE);
    return parsed;
  } catch (error) {
    return clone(SAMPLE_STATE);
  }
}

function saveState(showToast = false) {
  syncMetaFromFields();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (showToast) toast('브라우저에 저장했습니다.');
}

function bindMeta() {
  els.agency.value = state.meta.agency || '';
  els.projectName.value = state.meta.projectName || '';
  els.bidDate.value = state.meta.bidDate || '';
  els.contractDate.value = state.meta.contractDate || '';
  els.compareDate.value = state.meta.compareDate || '';
  els.memo.value = state.meta.memo || '';

  [els.agency, els.projectName, els.bidDate, els.contractDate, els.compareDate, els.memo].forEach((el) => {
    el.addEventListener('input', () => {
      syncMetaFromFields();
      render(false);
      saveState(false);
    });
  });
}

function bindActions() {
  els.saveBtn.addEventListener('click', () => saveState(true));
  els.printBtn.addEventListener('click', () => window.print());

  els.loadSampleBtn.addEventListener('click', () => {
    state = clone(SAMPLE_STATE);
    refreshMetaFields();
    render();
    saveState(false);
    toast('샘플 데이터를 불러왔습니다.');
  });

  els.addGroupBtn.addEventListener('click', () => {
    state.groups.push({
      id: uid(),
      name: '신규 비목군',
      items: [{ id: uid(), name: '신규 비목', cost: 0, baseIndex: 100, compareIndex: 100, note: '' }]
    });
    render();
    saveState(false);
  });

  els.addItemBtn.addEventListener('click', () => {
    const directGroup = state.groups.find((group) => group.name === '직접공사비') || state.groups[0];
    if (!directGroup) return;
    directGroup.items.push({ id: uid(), name: '신규 비목', cost: 0, baseIndex: 100, compareIndex: 100, note: '' });
    render();
    saveState(false);
  });

  els.validateBtn.addEventListener('click', () => {
    const stats = calculateStats();
    const messages = buildValidationMessages(stats);
    if (messages.length === 0) {
      showModal('검토 결과', '입력 구조상 특별한 오류는 확인되지 않았습니다.\n계수 합계와 지수 입력 상태가 정상입니다.');
    } else {
      showModal('검토 필요', messages.join('\n'));
    }
  });

  els.exportBtn.addEventListener('click', () => {
    syncMetaFromFields();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const fileName = (state.meta.projectName || 'ES_조정율_산출기').replace(/[\\/:*?"<>|]/g, '_') + '.json';
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  els.importInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.groups)) throw new Error('invalid');
      state = parsed;
      refreshMetaFields();
      render();
      saveState(false);
      toast('JSON 데이터를 불러왔습니다.');
    } catch (error) {
      showModal('불러오기 실패', '유효한 JSON 파일이 아닙니다.');
    } finally {
      event.target.value = '';
    }
  });

  els.resetBtn.addEventListener('click', () => {
    if (!confirm('현재 입력값을 초기 샘플 구조로 되돌릴까요?')) return;
    state = clone(SAMPLE_STATE);
    refreshMetaFields();
    render();
    saveState(false);
  });

  els.modalClose.addEventListener('click', closeModal);
  els.modalOk.addEventListener('click', closeModal);
  els.modalBackdrop.addEventListener('click', (event) => {
    if (event.target === els.modalBackdrop) closeModal();
  });
}

function bindSideMenu() {
  $$('#sideMenu .side-item').forEach((button) => {
    button.addEventListener('click', () => {
      $$('#sideMenu .side-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const target = button.dataset.panel;
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function syncMetaFromFields() {
  state.meta.agency = els.agency.value;
  state.meta.projectName = els.projectName.value;
  state.meta.bidDate = els.bidDate.value;
  state.meta.contractDate = els.contractDate.value;
  state.meta.compareDate = els.compareDate.value;
  state.meta.memo = els.memo.value;
}

function refreshMetaFields() {
  els.agency.value = state.meta.agency || '';
  els.projectName.value = state.meta.projectName || '';
  els.bidDate.value = state.meta.bidDate || '';
  els.contractDate.value = state.meta.contractDate || '';
  els.compareDate.value = state.meta.compareDate || '';
  els.memo.value = state.meta.memo || '';
}

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  return Number(String(value ?? '').replace(/,/g, '').trim()) || 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(parseNumber(value));
}

function formatFixed(value, digits = 4) {
  return parseNumber(value).toFixed(digits);
}

function calculateStats() {
  const flatItems = state.groups.flatMap((group) => (group.items || []).map((item) => ({ group, item })));
  const totalCost = flatItems.reduce((sum, entry) => sum + parseNumber(entry.item.cost), 0);

  let totalCoefficient = 0;
  let finalES = 0;
  let zeroBaseCount = 0;
  let emptyNameCount = 0;

  const computed = flatItems.map(({ group, item }) => {
    const cost = parseNumber(item.cost);
    const baseIndex = parseNumber(item.baseIndex);
    const compareIndex = parseNumber(item.compareIndex);
    const coefficient = totalCost > 0 ? cost / totalCost : 0;
    const fluctuationRate = baseIndex > 0 ? compareIndex / baseIndex : 0;
    const adjustmentCoefficient = baseIndex > 0 ? coefficient * (fluctuationRate - 1) : 0;

    totalCoefficient += coefficient;
    finalES += adjustmentCoefficient;

    if (baseIndex <= 0) zeroBaseCount += 1;
    if (!String(item.name || '').trim()) emptyNameCount += 1;

    return {
      key: `${group.id}:${item.id}`,
      cost,
      baseIndex,
      compareIndex,
      coefficient,
      fluctuationRate,
      adjustmentCoefficient
    };
  });

  return {
    totalCost,
    totalCoefficient,
    finalES,
    zeroBaseCount,
    emptyNameCount,
    computed
  };
}

function buildValidationMessages(stats) {
  const messages = [];
  if (stats.totalCost <= 0) messages.push('- 총 적용대가가 0입니다.');
  if (Math.abs(stats.totalCoefficient - 1) > 0.0001 && stats.totalCost > 0) messages.push('- 계수 합계가 1.0000이 아닙니다.');
  if (stats.zeroBaseCount > 0) messages.push(`- 기준지수가 0인 비목 ${stats.zeroBaseCount}건이 있습니다.`);
  if (stats.emptyNameCount > 0) messages.push(`- 비목명 미입력 ${stats.emptyNameCount}건이 있습니다.`);
  return messages;
}

function render(showToastOnSave = false) {
  syncMetaFromFields();
  const stats = calculateStats();
  const computedMap = new Map(stats.computed.map((entry) => [entry.key, entry]));

  els.tableBody.innerHTML = '';

  state.groups.forEach((group, groupIndex) => {
    const subtotalCost = (group.items || []).reduce((sum, item) => sum + parseNumber(item.cost), 0);
    const subtotalCoefficient = stats.totalCost > 0 ? subtotalCost / stats.totalCost : 0;

    const groupRow = document.createElement('tr');
    groupRow.className = 'groupRow';
    groupRow.innerHTML = `
      <td><input class="tableInput groupName" data-role="group-name" data-group-index="${groupIndex}" value="${escapeHtml(group.name || '')}"></td>
      <td class="mono right">${formatNumber(subtotalCost)}</td>
      <td class="mono right">${formatFixed(subtotalCoefficient)}</td>
      <td colspan="5"></td>
      <td class="no-print center">
        <div class="row wrap" style="justify-content:center">
          <button class="btn smallAction" type="button" data-action="add-item" data-group-index="${groupIndex}">비목 추가</button>
          <button class="btn smallAction" type="button" data-action="delete-group" data-group-index="${groupIndex}">비목군 삭제</button>
        </div>
      </td>
    `;
    els.tableBody.appendChild(groupRow);

    group.items.forEach((item, itemIndex) => {
      const computed = computedMap.get(`${group.id}:${item.id}`) || {
        coefficient: 0,
        fluctuationRate: 0,
        adjustmentCoefficient: 0
      };
      const signClass = computed.adjustmentCoefficient < 0 ? 'value-negative' : 'value-positive';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input class="tableInput" data-role="item-name" data-group-index="${groupIndex}" data-item-index="${itemIndex}" value="${escapeHtml(item.name || '')}" placeholder="비목명"></td>
        <td><input class="tableInput right mono" data-role="item-cost" data-group-index="${groupIndex}" data-item-index="${itemIndex}" value="${formatNumber(item.cost)}" placeholder="0"></td>
        <td><input class="tableInput readonly right mono" value="${formatFixed(computed.coefficient)}" readonly></td>
        <td><input class="tableInput right mono" data-role="item-base" data-group-index="${groupIndex}" data-item-index="${itemIndex}" value="${item.baseIndex ?? 0}" placeholder="0"></td>
        <td><input class="tableInput right mono" data-role="item-compare" data-group-index="${groupIndex}" data-item-index="${itemIndex}" value="${item.compareIndex ?? 0}" placeholder="0"></td>
        <td><input class="tableInput readonly right mono" value="${formatFixed(computed.fluctuationRate)}" readonly></td>
        <td><input class="tableInput readonly right mono ${signClass}" value="${formatFixed(computed.adjustmentCoefficient)}" readonly></td>
        <td><input class="tableInput" data-role="item-note" data-group-index="${groupIndex}" data-item-index="${itemIndex}" value="${escapeHtml(item.note || '')}" placeholder="비고"></td>
        <td class="no-print center"><button class="btn smallAction" type="button" data-action="delete-item" data-group-index="${groupIndex}" data-item-index="${itemIndex}">삭제</button></td>
      `;
      els.tableBody.appendChild(row);
    });
  });

  bindTableInputs();

  els.kpiTotalCost.textContent = formatNumber(stats.totalCost);
  els.kpiCoefficient.textContent = formatFixed(stats.totalCoefficient);
  els.kpiES.textContent = `${formatFixed(stats.finalES * 100)}%`;
  els.tfootTotalCost.textContent = formatNumber(stats.totalCost);
  els.tfootCoefficient.textContent = formatFixed(stats.totalCoefficient);
  els.tfootES.textContent = `${formatFixed(stats.finalES * 100)}%`;
  els.summaryAgency.textContent = state.meta.agency || '-';
  els.summaryProject.textContent = state.meta.projectName || '-';
  els.summaryCompareDate.textContent = state.meta.compareDate || '-';

  const messages = buildValidationMessages(stats);
  if (messages.length === 0) {
    els.kpiStatus.textContent = '정상';
    els.statusBox.textContent = '정상';
    els.statusBox.style.color = '#166534';
    els.statusBox.style.background = 'rgba(220,252,231,.85)';
    els.statusBox.style.borderColor = 'rgba(22,101,52,.18)';
  } else if (messages.length <= 2) {
    els.kpiStatus.textContent = '검토 필요';
    els.statusBox.textContent = `검토 필요 · ${messages.join(' ')}`;
    els.statusBox.style.color = '#92400e';
    els.statusBox.style.background = 'rgba(254,243,199,.9)';
    els.statusBox.style.borderColor = 'rgba(146,64,14,.16)';
  } else {
    els.kpiStatus.textContent = '오류 다수';
    els.statusBox.textContent = `오류 다수 · ${messages.join(' ')}`;
    els.statusBox.style.color = '#991b1b';
    els.statusBox.style.background = 'rgba(254,226,226,.88)';
    els.statusBox.style.borderColor = 'rgba(153,27,27,.16)';
  }

  if (showToastOnSave) saveState(true);
}

function bindTableInputs() {
  $$('#tableBody [data-role]').forEach((input) => {
    input.addEventListener('input', handleInputChange);
  });

  $$('#tableBody [data-action]').forEach((button) => {
    button.addEventListener('click', handleTableAction);
  });
}

function handleInputChange(event) {
  const role = event.target.dataset.role;
  const groupIndex = Number(event.target.dataset.groupIndex);
  const itemIndex = Number(event.target.dataset.itemIndex);

  if (role === 'group-name') {
    state.groups[groupIndex].name = event.target.value;
  }
  if (role === 'item-name') {
    state.groups[groupIndex].items[itemIndex].name = event.target.value;
  }
  if (role === 'item-note') {
    state.groups[groupIndex].items[itemIndex].note = event.target.value;
  }
  if (role === 'item-cost') {
    const cleaned = event.target.value.replace(/[^0-9.-]/g, '');
    state.groups[groupIndex].items[itemIndex].cost = parseNumber(cleaned);
    event.target.value = cleaned ? formatNumber(cleaned) : '';
  }
  if (role === 'item-base') {
    state.groups[groupIndex].items[itemIndex].baseIndex = parseNumber(event.target.value.replace(/[^0-9.-]/g, ''));
  }
  if (role === 'item-compare') {
    state.groups[groupIndex].items[itemIndex].compareIndex = parseNumber(event.target.value.replace(/[^0-9.-]/g, ''));
  }

  render();
  saveState(false);
}

function handleTableAction(event) {
  const action = event.target.dataset.action;
  const groupIndex = Number(event.target.dataset.groupIndex);
  const itemIndex = Number(event.target.dataset.itemIndex);

  if (action === 'add-item') {
    state.groups[groupIndex].items.push({ id: uid(), name: '신규 비목', cost: 0, baseIndex: 100, compareIndex: 100, note: '' });
  }

  if (action === 'delete-item') {
    state.groups[groupIndex].items.splice(itemIndex, 1);
    if (state.groups[groupIndex].items.length === 0) {
      state.groups[groupIndex].items.push({ id: uid(), name: '신규 비목', cost: 0, baseIndex: 100, compareIndex: 100, note: '' });
    }
  }

  if (action === 'delete-group') {
    state.groups.splice(groupIndex, 1);
    if (state.groups.length === 0) {
      state.groups.push({ id: uid(), name: '신규 비목군', items: [{ id: uid(), name: '신규 비목', cost: 0, baseIndex: 100, compareIndex: 100, note: '' }] });
    }
  }

  render();
  saveState(false);
}

function toast(message) {
  const item = document.createElement('div');
  item.className = 't';
  item.textContent = message;
  els.toastHost.appendChild(item);
  setTimeout(() => {
    item.remove();
  }, 2200);
}

function showModal(title, text) {
  els.modalTitle.textContent = title;
  els.modalBody.textContent = text;
  els.modalBackdrop.classList.remove('hidden');
}

function closeModal() {
  els.modalBackdrop.classList.add('hidden');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
