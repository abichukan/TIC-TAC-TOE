const App = {
    $: {
        menu : document.querySelector('[data-id="menu"]'),
        menuItem : document.querySelector("[data-id=\"menu-items\"]"),
        resetBtn : document.querySelector('[data-id="reset-btn"]'),
        newRoundBtn : document.querySelector('[data-id="new-round-btn"]'),
        squares : document.querySelectorAll('[data-id="square"]'),
        turnIndicatorText : document.getElementById('turn-indicator-text'),
        turnIndicatorIcon : document.getElementById('turn-indicator-icon'),
        bgColor : document.querySelector('.fullViewport'),
        landingPage : document.getElementById('mainBg'),
        grid : document.querySelector('[data-id="grid"]'),
    },
        

    state: {
        currentPlayer: 1,
        board: ['', '', '', '', '', '', '', '', ''], // Initializing an empty board
        player1Wins:0,
        player2Wins: 0,
        ties: 0,
    },       

    surpriseTimer: {
       timer: null,
       timerDuration: 0,
       timerStartAllowed: false,
       startbtn: document.getElementById('start-timer'),
    },

    init() {
        App.registerEventListeners();      
        App.showLandingPage(); 
    },

    showLandingPage() {
        App.$.landingPage.classList.remove('hidden');
        App.$.grid.classList.add('hidden');
    },

    hideLandingPage() {
        App.$.landingPage.classList.add('hidden');
        App.$.grid.classList.remove('hidden');
    },

    //Timer Functionality
    startTimer(){
        clearInterval(App.surpriseTimer.timer); //clear Previous timer
        console.log('Previous Timer Cleared');

        //random duration
        const randomDuration = Math.floor(Math.random() * 3) + 2;
        App.surpriseTimer.timerDuration = randomDuration;
        console.log(`New Timer started with duration: ${randomDuration}s`);

        //update UI
        document.getElementById('timer-label').textContent = `${randomDuration}s`;
        console.log(`Timer updated: ${App.surpriseTimer.timerDuration}s remaining`);


        //Start the countdown
        App.surpriseTimer.timer = setInterval(() =>{
            App.surpriseTimer.timerDuration--;

            //Update UI
            document.getElementById('timer-label').textContent = `${App.surpriseTimer.timerDuration}s`;
            console.log(`Timer updated: ${App.state.timerDuration}s remaining`);


            //Blink background in red during the last 3 secounds
            if (App.surpriseTimer.timerDuration <= 2){
                document.querySelector('.grid').classList.add('blinking');
                console.log("Background blinking activated.");
            }

            //if timer runs out remove the player's last move
            if(App.surpriseTimer.timerDuration <= 0){
                clearInterval(App.surpriseTimer.timer);
                console.log("Time is up! Handling timeout.");
                App.handleTimeOut();
            }

        }, 1000);

    },

    //Handle TimeOut Function
    handleTimeOut(){
    const lastMove = App.state.board.lastIndexOf(App.state.currentPlayer === 1? 'X' : 'O');
    if (lastMove !== -1){
        App.state.board[lastMove] = '';
        document.getElementById(lastMove).innerHTML ='';
    }
    // Toggle the Current Player
     App.state.currentPlayer = App.state.currentPlayer === 1 ? 2 : 1;

     // Update Turn Indicator
     App.updateTurnIndicator();

     //Start the timer for the next player
     App.startTimer();
    },


    registerEventListeners() {
        //Start button
        App.surpriseTimer.startbtn.addEventListener("click", () =>{
            App.surpriseTimer.timerStartAllowed = true;
            App.startTimer();
            App.hideLandingPage();
         });


        //---Toggle Menu
        this.$.menu.addEventListener("click", () => {
            App.$.menuItem.classList.toggle("hidden");
        });

        //---Reset Functionality
        this.$.resetBtn.addEventListener("click", () => {
            App.$.squares.forEach(square => {
                square.innerHTML = '';
            });

            // Reset player to 1
            App.state.currentPlayer = 1;

            // Update Turn Indicator
            this.updateTurnIndicator();
        });

        this.$.newRoundBtn.addEventListener("click", () => {
            App.resetGame(); 

            //clear the Scoreboard
            App.state.player1Wins = 0;
            App.state.player2Wins = 0;
            App.state.ties = 0;

            //Update the Scoreboard HTML
            document.querySelector('[data-id="P1-wins"]').textContent ='0 Wins';
            document.querySelector('[data-id="P2-wins"]').textContent ='0 Wins';
            document.querySelector('[data-id="ties"]').textContent ='0';
        });

        //---Function for Playing
        this.$.squares.forEach(square => {
            square.addEventListener("click", () => {

                if(!App.surpriseTimer.timerStartAllowed) return; //Prevent clicks before the start


                if (!square.innerHTML && !App.checkForWinner(App.state.board)) {
                    if (App.state.currentPlayer === 1) {
                        square.innerHTML = `<i class="fa-solid fa-x turquoise"></i>`;
                        App.state.board[square.id] = 'X';
                    } else {
                        square.innerHTML = `<i class="fa-solid fa-o yellow"></i>`;
                        App.state.board[square.id] = 'O';
                    }

                    //Clear current player and start timer for next player
                    clearInterval(App.surpriseTimer.timer);

                    // Toggle the Current Player
                    App.state.currentPlayer = App.state.currentPlayer === 1 ? 2 : 1;

                    // Update Turn Indicator
                    App.updateTurnIndicator();

                    App.startTimer();

                    

                    // Check for a winner after each move
                    const winner = App.checkForWinner(App.state.board);
                    if (winner) {
                        App.showWinnerModal(winner);
                    } else if (App.isTie()) {
                        App.showTieModal();
                    }
                }   
            });
        });
    },

    //---Function for Checking for Winner
    checkForWinner(board) {
        console.log("Checking for winner...");
        console.log("Current board:", board);
        const winningCombinations = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // First column
            [1, 4, 7], // Second column
            [2, 5, 8], // Third column
            [0, 4, 8], // Diagonal 1
            [2, 4, 6], // Diagonal 2
        ];

        // Iterate through each winning combination
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            console.log("Checking combination:", a, b, c);
            if (
                board[a] !== '' &&
                board[a] === board[b] &&
                board[b] === board[c]
            ) {
                console.log("Winner found:", board[a]);
                return board[a] === 'X' ? 1 : 2;
            }
        }
        console.log("No winner found.");
        return null;
    },

    //---Function for Updating Turn Indicator 
    updateTurnIndicator() {
        if (App.state.currentPlayer === 1) {
            this.$.turnIndicatorText.textContent = "Player 1's Turn!";
            this.$.turnIndicatorText.style.color = "turquoise";
            this.$.turnIndicatorIcon.className = "fa-solid fa-x turquoise";
            this.$.bgColor.style.backgroundColor ='#2E1850';
           // this.$.squares.forEach(square => {
             //   square.style.backgroundColor = '#2e4756';
          //  });
           
        } else {
            this.$.turnIndicatorText.textContent = "Player 2's Turn!";
            this.$.turnIndicatorText.style.color = '#f2b147';
            this.$.turnIndicatorIcon.className = "fa-solid fa-o yellow";      
            this.$.bgColor.style.backgroundColor ='#39163D';      
          //  this.$.squares.forEach(square => {
            //    square.style.backgroundColor = '#9A6C08';
           // });
        }
    },

    showWinnerModal(winner) {
        const modal = document.querySelector('[data-id="modal"]');
        const modalText = document.querySelector('[data-id="modal-text"]');
        const modalBtn = document.querySelector('[data-id="modal-btn"]');
        const modalImage = document.querySelector('[data-id="modal-image"]');

        modalText.textContent = `Player ${winner} Wins!`;
        modal.classList.remove('hidden');
        modalImage.src ="win.png";

        modalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            App.resetGame(); 
        });

        if (winner === 1){
            App.state.player1Wins++;
        }else if (winner === 2){
            App.state.player2Wins++;
        }

        // Updating the scoreboard in the HTML
        document.querySelector('[data-id="P1-wins"]').textContent = App.state.player1Wins + ' Wins';
        document.querySelector('[data-id="P2-wins"]').textContent = App.state.player2Wins + ' Wins';
    },

    showTieModal(){
        console.log("Showing tie Modal");
        const modal = document.querySelector('[data-id="modal"]');
        const modalText = document.querySelector('[data-id="modal-text"]');
        const modalBtn = document.querySelector('[data-id="modal-btn"]');
        const modalImage = document.querySelector('[data-id="modal-image"]');

        modalText.textContent = 'It \'s\ a tie: the universe’s way of saying, ‘meh.';
        modal.classList.remove('hidden');
        modalImage.src ="meh.png";
        App.state.ties++;
        document.querySelector('[data-id="ties"]').textContent = App.state.ties;

        modalBtn.addEventListener('click', () =>{
            modal.classList.add('hidden');
            App.resetGame();
        });
    },

    resetGame() {
        console.log("Resetting the game");
        App.$.squares.forEach(square => {
            square.innerHTML = '';
        });
        App.state.board = ['', '', '', '', '', '', '', '', ''];
        App.state.currentPlayer = 1;
        App.updateTurnIndicator();
    },

    isTie() {
        console.log("Checking for tie");
        console.log("Board:", App.state.board);
        return !App.state.board.includes('') && !App.checkForWinner(App.state.board);
    }
};

window.addEventListener("load", App.init);
