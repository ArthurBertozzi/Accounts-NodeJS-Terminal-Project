// módulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// módulos internos
const fs = require('fs')

operation()

// função do menu usando inquirer e criando a lista de opções
function operation() {

    inquirer.prompt([{
        // tipo será uma lista de opções
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        // opções da lista
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
            ]
        },
    ])
    .then((answer) => {
        // declaramos a opção do usuário que é a chave action da answer
        const action = answer['action']
        // tratando as opções do usuário
        if (action === 'Criar Conta') {
            createAccount()
        } else if (action === 'Consultar Saldo') {
            getAccountBalance()

        } else if (action === 'Depositar') {
            deposit()      
        } else if (action === 'Sacar') {
            widthdraw()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black.bold('Obrigado por usar o Accounts'))
            process.exit()
        }
    })
    .catch(err => console.log(err))

}

// criar uma conta
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {

    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para sua conta'
        }
    ])
    .then( (answer) => {
        const accountName = answer['accountName']
        // printando a variável
        console.info(accountName)

        // criando o diretório de armazenamento da conta
        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        // verificando se a conta já existe
        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe, escolha outra'),
                )
                buildAccount()
                // caso aconteça um bug retornamos
                return
        }

        // criar a conta
        fs.writeFileSync(`accounts/${accountName}.json`, 
                    '{"balance": 0}', 
                    function(err) {
                        console.log(err)
                        },
                    )
        
        // voltar para o menu inicial
        console.log(chalk.green('Parabéns sua conta foi criada'))
        operation()


    })
    .catch(err => console.log(err))

}

// função de depósito - adicionar um valor numa conta
function deposit() {
    inquirer.prompt([
        {
        name: 'accountName',
        message: 'Qual a conta deseja depositar?'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']
        // verificar se a conta existe
        if (!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja depositar?',
        }]).then((answer) => {
            const amount = answer['amount']

            // adicionar o valor na conta
            addAmount(accountName, amount)
            operation()
        })
        .catch(err => console.log(err))
        
    })
    .catch(err => console.log(err))
}

// função para checar se a conta existe para replicar no código
function checkAccount(accountName) {

    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black.bold('Esta conta não existe, escolha outro nome'))
        return false
    }

    return true
}

// função para depositar
function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log('Ocorreu um erro, tente nofvamente mais tarde!')
        return operation()
    }

    // obter o novo valor da conta
    accountData.balance = parseFloat(amount) + parseFloat (accountData.balance)

    // escrever o arquivo novamente
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        // transformar o json em texto
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi depositado R$${amount} na conta de nome ${accountName}`))

}

// função para pegar o arquivo da conta
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)
}

// exibir o extrato da conta
function getAccountBalance() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual a conta que deseja ver o saldo?',

        }
    ]).then((answer)=> {
        const accountName = answer['accountName']

        // verificar se a conta existe
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black.bold(
            `O saldo da sua conta é de R$${accountData.balance}`
        ),)
        operation()

    })
    .catch(err => console.log(err))
}

// função de saque
function widthdraw() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual a conta que você deseja sacar?'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        // validando o nome da conta
        if(!checkAccount(accountName)) {
            return widthdraw()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto deseja sacar?'
        }])
        .then((answer) => {
            const amount = answer['amount']
    
            // função de remover o saldo
            removeAmount(accountName, amount)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

// função para remover o saldo de acordo com o amount

function removeAmount(accountName, amount) {
    // obtendo o arquivo
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'),)
        return widthdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black.bold('Valor indisponível'))
        return widthdraw()
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {console.log(err)})

    console.log(chalk.green(`Saque de R$${amount} realizado com sucesso.`))

    operation()
}