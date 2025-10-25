document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DAS ABAS ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- FUNÇÕES GLOBAIS DE FORMATAÇÃO ---
    function formatCurrency(value, precise = false) {
        if (precise) {
            return `R$ ${value.toFixed(4).replace('.', ',')}`;
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- LÓGICA 1: CALCULADORA SIMPLES ---
    
    // Elementos da Calculadora
    const simplePriceForm = document.getElementById('simple-price-form');
    const simpleItemNameInput = document.getElementById('simple-item-name');
    const simpleTotalPriceInput = document.getElementById('simple-total-price');
    const simpleTotalWeightInput = document.getElementById('simple-total-weight');
    const simpleWeightUnitInput = document.getElementById('simple-weight-unit');
    
    // Elementos de Resultado
    const simpleResultsCard = document.getElementById('simple-results-card');
    const simplePricePerGramOutput = document.getElementById('simple-price-per-gram');
    const simpleCustomAmountInput = document.getElementById('simple-custom-amount');
    const simpleCustomResultDiv = document.getElementById('simple-custom-result');
    const simpleCustomCostOutput = document.getElementById('simple-custom-cost');
    const saveHistoryBtn = document.getElementById('save-history-btn'); 

    // Elementos do Histórico
    const historyCard = document.getElementById('history-card');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // RÓTULOS DINÂMICOS
    const baseUnitLabel = document.getElementById('base-unit-label');
    const customUnitLabel = document.getElementById('custom-unit-label');
    const customAmountDisplay = document.getElementById('custom-amount-display');
    const customResultUnitLabel = document.getElementById('custom-result-unit-label');

    let history = []; 
    let currentCalcData = {}; // Objeto para o cálculo atual

    // Evento de submit (APENAS CALCULAR)
    simplePriceForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const totalPrice = parseFloat(simpleTotalPriceInput.value);
        const totalWeight = parseFloat(simpleTotalWeightInput.value); 
        const unit = simpleWeightUnitInput.value;
        const itemName = simpleItemNameInput.value.trim() || 'Cálculo Sem Nome';

        if (isNaN(totalPrice) || isNaN(totalWeight) || totalWeight <= 0) {
            alert('Por favor, insira valores válidos para preço e peso/volume.');
            return;
        }

        const isLiquid = (unit === 'l' || unit === 'ml');
        const baseUnit = isLiquid ? 'ml' : 'g';
        let totalBaseUnits;

        if (isLiquid) {
            totalBaseUnits = (unit === 'l') ? (totalWeight * 1000) : totalWeight; 
        } else {
            totalBaseUnits = (unit === 'kg') ? (totalWeight * 1000) : totalWeight; 
        }

        const pricePerUnit = totalPrice / totalBaseUnits;
        
        currentCalcData = {
            id: Date.now(),
            name: itemName,
            totalPrice: totalPrice,
            totalWeight: totalWeight, 
            unit: unit, 
            pricePerUnit: pricePerUnit, 
            unitType: baseUnit, 
            customAmount: null,
            customCost: null
        };

        if (isLiquid) {
            baseUnitLabel.textContent = 'Mililitro';
            customUnitLabel.textContent = 'mililitros';
            customResultUnitLabel.textContent = 'ml';
        } else {
            baseUnitLabel.textContent = 'Grama';
            customUnitLabel.textContent = 'gramas';
            customResultUnitLabel.textContent = 'g';
        }

        simplePricePerGramOutput.textContent = formatCurrency(pricePerUnit, true);
        
        simpleCustomAmountInput.value = '';
        simpleCustomResultDiv.style.display = 'none';
        simpleResultsCard.style.display = 'block';
    });

    // Evento de input do cálculo customizado
    simpleCustomAmountInput.addEventListener('input', () => {
        const customAmount = parseFloat(simpleCustomAmountInput.value);
        const pricePerUnit = currentCalcData.pricePerUnit || 0;

        if (isNaN(customAmount) || customAmount <= 0) {
            simpleCustomResultDiv.style.display = 'none';
            currentCalcData.customAmount = null; 
            currentCalcData.customCost = null;   
            return;
        }
        
        const customCost = pricePerUnit * customAmount;
        customAmountDisplay.textContent = customAmount;
        simpleCustomCostOutput.textContent = formatCurrency(customCost);
        simpleCustomResultDiv.style.display = 'flex';
        
        currentCalcData.customAmount = customAmount;
        currentCalcData.customCost = customCost;
    });

    // Evento: Salvar no Histórico
    saveHistoryBtn.addEventListener('click', () => {
        if (!currentCalcData.pricePerUnit) {
            alert("Erro: não há cálculo para salvar.");
            return;
        }
        history.unshift(currentCalcData);
        if (history.length > 15) { history.pop(); }
        saveHistory(); 
        simplePriceForm.reset(); 
        simpleResultsCard.style.display = 'none'; 
        currentCalcData = {}; 
    });

    // --- FUNÇÕES DE HISTÓRICO ---
    function loadHistory() {
        const storedHistory = localStorage.getItem('calcHistory');
        history = storedHistory ? JSON.parse(storedHistory) : [];
        renderHistory();
    }
    function saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory(); 
    }
    function clearHistory() {
        history = [];
        localStorage.removeItem('calcHistory');
        renderHistory(); 
    }

    // RenderHistory (CORRIGIDA)
    function renderHistory() {
        historyList.innerHTML = ''; 
        if (history.length === 0) {
            historyCard.style.display = 'none'; 
            return;
        }
        historyCard.style.display = 'block'; 

        history.forEach(item => {
            const li = document.createElement('li');
            
            const originalDesc = `${item.totalWeight} ${item.unit} por ${formatCurrency(item.totalPrice)}`;
            const resultText = `${formatCurrency(item.pricePerUnit, true)}/${item.unitType}`;

            let customCostHtml = '';
            if (item.customCost !== null && !isNaN(item.customCost)) {
                const customCostText = `${item.customAmount}${item.unitType} por ${formatCurrency(item.customCost)}`;
                customCostHtml = `<span class="history-custom-cost">${customCostText}</span>`;
            }

            li.innerHTML = `
                <div class="history-item-details">
                    <strong>${item.name}</strong>
                    <span>${originalDesc}</span>
                    ${customCostHtml}
                </div>
                <div class="history-item-price"> ${resultText}
                </div>
            `;
            historyList.appendChild(li);
        });
    }

    // --- LIGA OS EVENTOS DO HISTÓRICO ---
    clearHistoryBtn.addEventListener('click', clearHistory);
    loadHistory(); 


    // --- LÓGICA 2: COMPARADOR (ATUALIZADA) ---
    
    const compareForm = document.getElementById('compare-form');
    const cardA = document.getElementById('card-a');
    const cardB = document.getElementById('card-b');
    
    const unitLabelA = document.getElementById('unit-label-a');
    const unitLabelB = document.getElementById('unit-label-b');
    
    const priceA_input = document.getElementById('price-a');
    const weightA_input = document.getElementById('weight-a');
    const unitA_input = document.getElementById('unit-a');
    const resultA_div = document.getElementById('result-a');
    const pricePerGramA_output = document.getElementById('price-per-gram-a');

    const priceB_input = document.getElementById('price-b');
    const weightB_input = document.getElementById('weight-b');
    const unitB_input = document.getElementById('unit-b');
    const resultB_div = document.getElementById('result-b');
    const pricePerGramB_output = document.getElementById('price-per-gram-b');

    // Função auxiliar (CORRIGIDA)
    function calculateComparePricePerUnit(totalPrice, totalWeight, unit) {
        // CORREÇÃO: Permite preço 0 (igual à calculadora simples)
        if (isNaN(totalPrice) || isNaN(totalWeight) || totalWeight <= 0) {
            return null;
        }
        
        const isLiquid = (unit === 'l' || unit === 'ml');
        let totalBaseUnits;

        if (isLiquid) {
            totalBaseUnits = (unit === 'l') ? (totalWeight * 1000) : totalWeight;
        } else {
            totalBaseUnits = (unit === 'kg') ? (totalWeight * 1000) : totalWeight;
        }
        return totalPrice / totalBaseUnits;
    }

    // Evento de submit do Comparador
    compareForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const priceA = parseFloat(priceA_input.value);
        const weightA = parseFloat(weightA_input.value);
        const unitA = unitA_input.value;

        const priceB = parseFloat(priceB_input.value);
        const weightB = parseFloat(weightB_input.value);
        const unitB = unitB_input.value;

        const isLiquidA = (unitA === 'l' || unitA === 'ml');
        const isLiquidB = (unitB === 'l' || unitB === 'ml');

        if (isLiquidA !== isLiquidB) {
            alert('Não é possível comparar unidades de peso (g/kg) com unidades de volume (ml/L).');
            return;
        }

        const ppgA = calculateComparePricePerUnit(priceA, weightA, unitA);
        const ppgB = calculateComparePricePerUnit(priceB, weightB, unitB);

        // A validação de null agora está correta
        if (ppgA === null || ppgB === null) {
            alert('Por favor, preencha todos os campos do comparador.');
            return;
        }

        const baseUnit = isLiquidA ? 'ml' : 'g';
        unitLabelA.textContent = baseUnit;
        unitLabelB.textContent = baseUnit;

        pricePerGramA_output.textContent = formatCurrency(ppgA, true);
        resultA_div.style.display = 'flex';
        pricePerGramB_output.textContent = formatCurrency(ppgB, true);
        resultB_div.style.display = 'flex';

        cardA.classList.remove('best-deal');
        cardB.classList.remove('best-deal');
        cardA.querySelector('h2').textContent = 'Produto A';
        cardB.querySelector('h2').textContent = 'Produto B';

        if (ppgA < ppgB) {
            cardA.classList.add('best-deal');
            cardA.querySelector('h2').textContent = 'Produto A (Melhor Custo!)';
        } else if (ppgB < ppgA) {
            cardB.classList.add('best-deal');
            cardB.querySelector('h2').textContent = 'Produto B (Melhor Custo!)';
        } else {
            cardA.querySelector('h2').textContent = 'Produto A (Empate)';
            cardB.querySelector('h2').textContent = 'Produto B (Empate)';
        }
    });

});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar o Service Worker:', error);
      });
  });
}