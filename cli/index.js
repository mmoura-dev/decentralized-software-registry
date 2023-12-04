var blessed = require('blessed')

const createScreen = (oldScreen=null) => {
    if (oldScreen !== null) {
        oldScreen.destroy();
    }

    const _screen = blessed.screen({
        smartCSR: true
    });

    _screen.title = 'DSR';
    return _screen;
};
let screen = createScreen();

const createBox = (content) => blessed.box({
    top: 'center',
    left: 'center',
    width: '25%',
    height: '50%',
    content: ' ' + content,
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'magenta',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});

createDiv = () => blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: {
      type: 'line', // Set border type to 'line' to ensure it's visually not there
    },
    style: {
      fg: 'transparent', // Set foreground color to transparent
      bg: 'transparent', // Set background color to transparent
      border: {
        fg: 'transparent', // Set border color to transparent
      },
    },
});

// Welcome display
welcomeDisplay = () => {
    let container = createDiv();
    let welcomeBox = createBox("Welcome to DSR app!\n Press 'q' anytime to exit");
    container.append(welcomeBox);
    screen.append(container);

    welcomeBox.on('click', function(data) {
        screen.remove(container);
        screen.render();
    });

    return container;
}
welcomeDisplay();

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();
