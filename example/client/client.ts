import path from 'path';
import chalk from 'chalk';
import moment from 'moment';
import 'moment/locale/pt-br';

import SiTef from '../../src';
import config from '../shared/config';
import { messages, askQuestion, handleError } from '../shared/utils';

// Define o caminho para as DLLs do SiTef e instancia o client
/* const dlls = path.resolve(__dirname, '..', 'shared', 'bin', 'CliSiTef64I.so'); */
const dlls = path.resolve('/usr/lib/libclisitef.so')
const sitef = new SiTef(dlls);

// Função auxiliar para adicionar a timestamp nos logs
const now = () => chalk.green(`[${moment().format('LTS')}]`);

export const configurar = async () => {
  console.log(`\n${now()} Configurando o SiTef`);

  try {
    const response = await sitef.configurar(config);
    const message = messages.configuracao[response];
    console.log(now(), message, '\n');
  } catch (error: any) {
    handleError(error);
  }
};

export const verificarPresenca = async () => {
  console.log(`\n${now()} Verificando a presença do PinPad`);

  try {
    const response = await sitef.verificarPresenca();
    const message = messages.verificacaoPresenca[response];
    console.log(now(), message, '\n');
  } catch (error: any) {
    handleError(error);
  }
};

export const escreverMensagem = async () => {
  try {
    // Lê a mensagem que será escrita no PinPad
    const question = 'Qual mensagem deseja escrever (max. 30 letras): ';
    let message = await askQuestion(question);

    // Escreve a mensagem e processa o retorno
    const response = await sitef.escreverMensagem(message);
    message =
      response === 0
        ? 'Mensagem escrita com sucesso.'
        : 'Não foi possível escrever a mensagem.';

    console.log(`\n${now()}`, message, '\n');
  } catch (error: any) {
    handleError(error);
  }
};

const criaObjetoFuncao = (funcao: string, valor: string) => ({
  funcao: parseInt(funcao),
  valor: parseFloat(valor).toFixed(2).replace('.', ','),
  cupomFiscal: '12345678',
  dataFiscal: moment().format('YYYYMMDD'),
  horaFiscal: moment().format('HHmm'),
  operador: 'Teste',
  parametros: '[10;11;12;13;14;19;20;28;29;31;32;33;34;35;36]',
});

export const simularFuncao = async () => {
  let bufferRetorno = '';

  try {
    // Lê a função e o valor da função
    const funcao = await askQuestion('Qual a função? ');
    const valor = await askQuestion('Qual o valor? ');

    // Inicia a função
    console.log(`\n${now()} Iniciando a função`);

    // Envia o objeto contendo os dados da função. Esses dados são específicos do SiTef que estou utilizando,
    // então fique a vontade para alterar os parâmetros
    const objFuncao = criaObjetoFuncao(funcao, valor);
    let retorno = await sitef.iniciarFuncao(objFuncao);

    // Objeto contendo os retornos do SiTef que devem ser passados para função de continuação
    let tefMessage = {
      comando: 0,
      tipoCampo: 0,
      tamMinimo: 0,
      tamMaximo: 0,
      buffer: '',
      tamanhoBuffer: 0,
      continua: 0,
    };

    // Inicia o ciclo da função, conforme descrito na documentação
    while (retorno === 10000) {
      // Chama a função de continuação da função e finaliza o ciclo caso o retorno seja inválido
      const continua = await sitef.continuarFuncao(tefMessage);
      if (!continua) break;

      const { comando: cmd, buffer, retorno: ret } = continua;
      retorno = ret;

      // Escreve as mensagens de retorno e de buffer, caso retornado alguma
      console.log(
        now(),
        messages.funcao[ret] || `Retorno desconhecido (${ret})`
      );
      if (buffer) console.log(now(), buffer);

      // Limpa ou escreve no buffer, dependendo do comando
      if ([20, 21].includes(cmd) || (cmd >= 30 && cmd <= 35) || cmd === 42) {
        bufferRetorno = await askQuestion('Retorno: ');
      } else {
        bufferRetorno = '';
      }

      // Por fim, atualiza os parâmetros da continuação para continuar o ciclo
      tefMessage = {
        ...tefMessage,
        ...continua,
        buffer: bufferRetorno,
        tamanhoBuffer: bufferRetorno.length,
      };
    }

    // Por fim, finaliza a função
    const objFinalizacao = {
      ...objFuncao,
      confirma: 1,
      parametros: '',
    };
    await sitef.finalizarFuncao(objFinalizacao);

    const message = messages.funcao[retorno];
    console.log(now(), message, '\n');
  } catch (error: any) {
    handleError(error);
  }
};
