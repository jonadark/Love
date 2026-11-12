    const storageKey = 'dois-meses-de-nos-v1';
    const projectConfig = window.loveProjectConfig;
    const defaultLetter = 'Dois meses podem parecer pouco no calendário, mas para mim já cabem tantas coisas bonitas.\n\nObrigado por cada conversa, cada abraço e por fazer os dias comuns terem um motivo a mais para sorrir. Gosto de descobrir o seu mundo e de imaginar tudo o que ainda vamos viver juntos.\n\nFeliz nosso segundo mês. Que venham muitos outros, sempre com esse jeitinho tão nosso.';
    const defaultState = {
      nameOne: 'Jonathan', nameTwo: 'Rebeca', startDate: '', caption: '',
      intro: '', letter: defaultLetter,
      riddleQuestion: projectConfig.riddle.question,
      riddleHint: projectConfig.riddle.hint,
      riddleAnswer: projectConfig.riddle.answer,
      riddleReward: projectConfig.riddle.reward,
      photos: [null, null, null]
    };
    let state = loadState();
    let activePhotoIndex = 0;
    let riddleSolved = false;
    const mineRows = 8;
    const mineColumns = 8;
    const mineTotal = 10;
    let mineBoard = [];
    let firstMineClick = true;
    let gameOver = false;
    let flagMode = false;
    let toastTimer;

    function loadState() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (!saved || typeof saved !== 'object') return { ...defaultState, photos: [...defaultState.photos] };
        return {
          ...defaultState,
          ...saved,
          photos: Array.isArray(saved.photos) ? [...saved.photos, null, null, null].slice(0, 3) : [...defaultState.photos]
        };
      } catch {
        return { ...defaultState, photos: [...defaultState.photos] };
      }
    }

    function persist() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        return true;
      } catch {
        showToast('O armazenamento do navegador está cheio. Remova uma foto e tente novamente.');
        return false;
      }
    }

    function namesText() {
      if (state.nameOne && state.nameTwo) return `${state.nameOne} & ${state.nameTwo}`;
      if (state.nameOne || state.nameTwo) return `${state.nameOne || state.nameTwo} e meu amor`;
      return 'um capítulo nosso';
    }

    function formatDate(dateString) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-').map(Number);
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
    }

    function render() {
      document.title = state.nameOne && state.nameTwo ? `${state.nameOne} & ${state.nameTwo} | Dois meses de nós` : 'Dois meses de nós';
      document.getElementById('brandNames').textContent = namesText();
      document.getElementById('dateNote').textContent = state.startDate ? `desde ${formatDate(state.startDate)}` : 'um dia bonito para lembrar';
      document.getElementById('heroCopy').textContent = state.intro || defaultState.intro || 'Dois meses de conversas que viram madrugada, risadas sem motivo e um carinho que cresce a cada dia. E pensar que essa história está só começando.';
      document.getElementById('coupleCaption').textContent = `${state.caption || 'nosso comecinho'} ♥`;
      document.getElementById('momentTitle').textContent = state.startDate ? `Desde ${formatDate(state.startDate)}, tanta coisa bonita` : 'Um começo que já mora no coração';
      document.getElementById('momentDescription').textContent = state.startDate ? 'E esse é só o segundo capítulo da nossa história.' : 'Tem dias que parecem comuns, até virarem os nossos favoritos.';
      const photos = state.photos.map((photo, index) => photo || projectConfig.photos[index] || '');
      const heroFrame = document.getElementById('heroPhotoFrame');
      const secondFrame = document.getElementById('secondPhotoFrame');
      if (photos[0]) {
        const image = document.createElement('img');
        image.src = photos[0];
        image.alt = 'Nossa foto favorita';
        heroFrame.replaceChildren(image);
      } else {
        heroFrame.innerHTML = '<div class="photo-placeholder"><div class="placeholder-inner"><div class="placeholder-mark" aria-hidden="true">&hearts;</div><p>O nosso melhor registro merece um lugar aqui. Escolha uma foto para deixar essa página com a nossa cara.</p></div></div>';
      }
      if (photos[1]) {
        const image = document.createElement('img');
        image.src = photos[1];
        image.alt = 'Mais uma lembrança nossa';
        secondFrame.replaceChildren(image);
        secondFrame.classList.remove('empty');
        secondFrame.setAttribute('aria-hidden', 'false');
      } else {
        secondFrame.innerHTML = '&hearts;';
        secondFrame.classList.add('empty');
        secondFrame.setAttribute('aria-hidden', 'true');
      }
      document.getElementById('memoryGrid').innerHTML = [0, 1, 2].map((index) => {
        const titles = ['A nossa favorita', 'Um dia daqueles', 'Mais uma pra guardar'];
        const subtitles = ['Tem coisa que a gente guarda pra sempre.', 'Daqueles momentos que pedem bis.', 'E já estamos com saudade.'];
        const image = photos[index] ? '' : '<span>+ adicionar foto</span>';
        const remove = state.photos[index]
          ? `<button class="memory-remove" type="button" data-remove-photo="${index}" aria-label="Remover foto ${index + 1}">&times;</button>`
          : '';
        return `<article class="memory-item"><button class="memory-image" type="button" data-photo-index="${index}" aria-label="${photos[index] ? 'Trocar' : 'Adicionar'} ${titles[index]}">${image}</button>${remove}<p class="memory-caption">${titles[index]}</p><p class="memory-subcaption">${subtitles[index]}</p></article>`;
      }).join('');
      photos.forEach((photo, index) => {
        if (!photo) return;
        const image = document.createElement('img');
        image.src = photo;
        image.alt = ['A nossa favorita', 'Um dia daqueles', 'Mais uma pra guardar'][index];
        document.querySelector(`[data-photo-index="${index}"]`).append(image);
      });
      document.getElementById('anniversaryDate').innerHTML = state.startDate
        ? `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${state.startDate}T00:00:00Z`)).replace('.', '')} <span style="font-family: var(--sans); font-size: 11px;">NOSSO DIA</span>`
        : '02 <span style="font-family: var(--sans); font-size: 11px;">MESES</span>';
      document.getElementById('letterTitle').textContent = state.nameTwo ? `Para você, ${state.nameTwo}.` : 'Para você, meu amor.';
      document.getElementById('letterText').textContent = state.letter || defaultLetter;
      document.getElementById('letterSignoff').textContent = state.nameOne ? `com todo meu carinho, ${state.nameOne} ♥` : 'com todo meu carinho ♥';
      const riddleQuestion = document.getElementById('riddleQuestion');
      const riddleHint = document.getElementById('riddleHint');
      const hintButton = document.getElementById('hintButton');
      const riddleReward = document.getElementById('riddleReward');
      if (riddleQuestion) riddleQuestion.textContent = state.riddleQuestion;
      if (riddleHint) riddleHint.textContent = state.riddleHint;
      if (hintButton) hintButton.hidden = !state.riddleHint;
      if (riddleReward) {
        riddleReward.textContent = state.riddleReward;
        riddleReward.hidden = !riddleSolved;
      }
    }

    function resetRiddle() {
      riddleSolved = false;
      const riddleForm = document.getElementById('riddleForm');
      const feedback = document.getElementById('riddleFeedback');
      const riddleHint = document.getElementById('riddleHint');
      const riddleReward = document.getElementById('riddleReward');
      if (riddleForm) riddleForm.reset();
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'riddle-feedback';
      }
      if (riddleHint) riddleHint.hidden = true;
      if (riddleReward) riddleReward.hidden = true;
    }

    function renderQuestions() {
      const grid = document.getElementById('questionGrid');
      if (!grid) return;
      grid.replaceChildren();
      for (const question of projectConfig.form.questions) {
        const label = document.createElement('label');
        label.className = 'question-field';
        label.append(document.createTextNode(question.label));
        const input = document.createElement(question.type === 'textarea' ? 'textarea' : 'input');
        if (input.tagName === 'INPUT') input.type = 'text';
        input.name = question.id;
        input.maxLength = 500;
        input.required = true;
        label.append(input);
        grid.append(label);
      }
    }

    function createMineBoard() {
      const board = document.getElementById('minesBoard');
      if (!board) return;
      mineBoard = Array.from({ length: mineRows }, () =>
        Array.from({ length: mineColumns }, () => ({ mine: false, open: false, flagged: false, count: 0 }))
      );
      firstMineClick = true;
      gameOver = false;
      flagMode = false;
      const flagModeButton = document.getElementById('flagMode');
      if (flagModeButton) {
        flagModeButton.setAttribute('aria-pressed', 'false');
        flagModeButton.textContent = 'Marcar bandeiras: desligado';
      }
      const minesStatus = document.getElementById('minesStatus');
      if (minesStatus) minesStatus.textContent = 'Boa sorte, meu amor! ♥';
      renderMineBoard();
    }

    function placeMines(safeRow, safeColumn) {
      const available = [];
      for (let row = 0; row < mineRows; row += 1) {
        for (let column = 0; column < mineColumns; column += 1) {
          if (row !== safeRow || column !== safeColumn) available.push([row, column]);
        }
      }
      for (let index = 0; index < mineTotal; index += 1) {
        const selected = Math.floor(Math.random() * available.length);
        const [row, column] = available.splice(selected, 1)[0];
        mineBoard[row][column].mine = true;
      }
      for (let row = 0; row < mineRows; row += 1) {
        for (let column = 0; column < mineColumns; column += 1) {
          if (mineBoard[row][column].mine) continue;
          for (let adjacentRow = Math.max(0, row - 1); adjacentRow <= Math.min(mineRows - 1, row + 1); adjacentRow += 1) {
            for (let adjacentColumn = Math.max(0, column - 1); adjacentColumn <= Math.min(mineColumns - 1, column + 1); adjacentColumn += 1) {
              if (mineBoard[adjacentRow][adjacentColumn].mine) mineBoard[row][column].count += 1;
            }
          }
        }
      }
      firstMineClick = false;
    }

    function renderMineBoard() {
      const board = document.getElementById('minesBoard');
      if (!board) return;
      const flags = mineBoard.flat().filter((cell) => cell.flagged).length;
      const minesCounter = document.getElementById('minesCounter');
      if (minesCounter) minesCounter.textContent = `Minas restantes: ${mineTotal - flags}`;
      board.replaceChildren();
      mineBoard.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'mine-cell';
          button.dataset.row = rowIndex;
          button.dataset.column = columnIndex;
          button.setAttribute('role', 'gridcell');
          if (cell.open) {
            button.classList.add('is-open');
            if (cell.mine) {
              button.classList.add('is-mine');
              button.textContent = '💣';
              button.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}, mina`);
            } else if (cell.count > 0) {
              button.textContent = cell.count;
              button.dataset.count = cell.count;
              button.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}, ${cell.count} minas próximas`);
            } else {
              button.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}, vazio`);
            }
          } else if (cell.flagged) {
            button.classList.add('is-flagged');
            button.textContent = '⚑';
            button.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}, marcada com bandeira`);
          } else {
            button.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}, fechado`);
          }
          button.disabled = gameOver || cell.open;
          board.append(button);
        });
      });
    }

    function openMineCell(rowIndex, columnIndex) {
      if (gameOver) return;
      const cell = mineBoard[rowIndex]?.[columnIndex];
      if (!cell || cell.open || cell.flagged) return;
      if (firstMineClick) placeMines(rowIndex, columnIndex);
      if (mineBoard[rowIndex][columnIndex].mine) {
        mineBoard.forEach((row) => row.forEach((item) => { if (item.mine) item.open = true; }));
        gameOver = true;
        document.getElementById('minesStatus').textContent = 'Ops! Você encontrou uma mina. Tente de novo! ♥';
        renderMineBoard();
        return;
      }

      const pending = [[rowIndex, columnIndex]];
      while (pending.length) {
        const [row, column] = pending.pop();
        const current = mineBoard[row][column];
        if (current.open || current.flagged || current.mine) continue;
        current.open = true;
        if (current.count === 0) {
          for (let adjacentRow = Math.max(0, row - 1); adjacentRow <= Math.min(mineRows - 1, row + 1); adjacentRow += 1) {
            for (let adjacentColumn = Math.max(0, column - 1); adjacentColumn <= Math.min(mineColumns - 1, column + 1); adjacentColumn += 1) {
              if (!mineBoard[adjacentRow][adjacentColumn].open) pending.push([adjacentRow, adjacentColumn]);
            }
          }
        }
      }

      const safeCells = mineBoard.flat().filter((item) => !item.mine);
      if (safeCells.every((item) => item.open)) {
        gameOver = true;
        document.getElementById('minesStatus').textContent = 'Você venceu! Ganhou muitos beijinhos! ♥';
      }
      renderMineBoard();
    }

    function toggleMineFlag(rowIndex, columnIndex) {
      if (gameOver) return;
      const cell = mineBoard[rowIndex]?.[columnIndex];
      if (!cell || cell.open) return;
      const flags = mineBoard.flat().filter((item) => item.flagged).length;
      if (!cell.flagged && flags >= mineTotal) return;
      cell.flagged = !cell.flagged;
      renderMineBoard();
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
    }

    function openEditor() {
      const form = document.getElementById('editForm');
      for (const [key, value] of Object.entries(state)) {
        if (key === 'photos') continue;
        const element = form.elements.namedItem(key);
        if (element) element.value = value;
      }
      document.getElementById('editDialog').showModal();
    }

    document.getElementById('editButton').addEventListener('click', openEditor);
    document.getElementById('heroLetterButton').addEventListener('click', () => document.getElementById('letterDialog').showModal());
    document.getElementById('footerLetterButton').addEventListener('click', () => document.getElementById('letterDialog').showModal());
    document.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
    });
    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    document.getElementById('editForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      for (const key of Object.keys(defaultState)) {
        if (key !== 'photos') state[key] = values.get(key)?.toString().trim() ?? '';
      }
      if (persist()) {
        resetRiddle();
        render();
        document.getElementById('editDialog').close();
        showToast('Tudo salvo. Ficou a cara de vocês!');
      }
    });

    const hintButton = document.getElementById('hintButton');
    if (hintButton) {
      hintButton.addEventListener('click', () => {
        const riddleHint = document.getElementById('riddleHint');
        if (riddleHint) riddleHint.hidden = false;
      });
    }

    const riddleForm = document.getElementById('riddleForm');
    if (riddleForm) {
      riddleForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const answer = document.getElementById('riddleAnswer').value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLocaleLowerCase('pt-BR');
        const expected = state.riddleAnswer
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLocaleLowerCase('pt-BR');
        const feedback = document.getElementById('riddleFeedback');
        riddleSolved = Boolean(expected) && answer === expected;
        if (feedback) {
          feedback.textContent = riddleSolved ? 'Você acertou! ♥' : 'Ainda não... tente mais uma vez.';
          feedback.className = `riddle-feedback ${riddleSolved ? 'is-correct' : 'is-incorrect'}`;
        }
        const riddleReward = document.getElementById('riddleReward');
        if (riddleReward) riddleReward.hidden = !riddleSolved;
      });
    }

    const questionsForm = document.getElementById('questionsForm');
    if (questionsForm) {
      questionsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('formFeedback');
        const submitButton = event.currentTarget.querySelector('button[type="submit"]');
        const values = new FormData(event.currentTarget);
        const answers = projectConfig.form.questions.map((question) => ({
          question: question.label,
          answer: values.get(question.id)?.toString().trim() || ''
        }));
        submitButton.disabled = true;
        if (feedback) feedback.textContent = 'Enviando suas respostas...';
        try {
          const response = await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Não foi possível enviar suas respostas.');
          if (feedback) feedback.textContent = 'Respostas enviadas com carinho. Obrigado! ♥';
          event.currentTarget.reset();
        } catch (error) {
          if (feedback) {
            feedback.textContent = error instanceof TypeError
              ? 'Não consegui conectar ao servidor. Inicie o projeto com npm start e tente novamente.'
              : error.message;
          }
        } finally {
          if (submitButton) submitButton.disabled = false;
        }
      });
    }

    const minesBoard = document.getElementById('minesBoard');
    if (minesBoard) {
      minesBoard.addEventListener('click', (event) => {
        const button = event.target.closest('[data-row][data-column]');
        if (!button) return;
        const row = Number(button.dataset.row);
        const column = Number(button.dataset.column);
        if (flagMode) toggleMineFlag(row, column);
        else openMineCell(row, column);
      });

      minesBoard.addEventListener('contextmenu', (event) => {
        const button = event.target.closest('[data-row][data-column]');
        if (!button) return;
        event.preventDefault();
        toggleMineFlag(Number(button.dataset.row), Number(button.dataset.column));
      });
    }

    const flagModeButton = document.getElementById('flagMode');
    if (flagModeButton) {
      flagModeButton.addEventListener('click', (event) => {
        flagMode = !flagMode;
        event.currentTarget.setAttribute('aria-pressed', String(flagMode));
        event.currentTarget.textContent = `Marcar bandeiras: ${flagMode ? 'ligado' : 'desligado'}`;
      });
    }

    const resetMinesButton = document.getElementById('resetMines');
    if (resetMinesButton) resetMinesButton.addEventListener('click', createMineBoard);

    document.getElementById('memoryGrid').addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-remove-photo]');
      if (removeButton) {
        const index = Number(removeButton.dataset.removePhoto);
        state.photos[index] = null;
        persist();
        render();
        showToast('Foto removida.');
        return;
      }
      const photoButton = event.target.closest('[data-photo-index]');
      if (photoButton) {
        activePhotoIndex = Number(photoButton.dataset.photoIndex);
        document.getElementById('photoPicker').click();
      }
    });

    document.getElementById('photoPicker').addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Escolha um arquivo de imagem.');
        event.target.value = '';
        return;
      }
      if (file.size > 2_500_000) {
        showToast('Essa foto pesa mais de 2,5 MB. Escolha uma imagem menor.');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        state.photos[activePhotoIndex] = reader.result;
        if (persist()) {
          render();
          showToast('Essa lembrança agora faz parte da página.');
        }
        event.target.value = '';
      });
      reader.readAsDataURL(file);
    });

    renderQuestions();
    render();
    createMineBoard();
