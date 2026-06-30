import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'; // Inectable é um decorator obrigatório para todo Service, marca a classe para o sistema de injeção do NestJS, NotFoundException retorna HTTP 404 automaticamente quando lançada
import { FirebaseService } from '../firebase/firebase.service'; // Importa o serviço de Firebase para acessar o Firestore, é necessário para realizar as operações de CRUD no banco de dados
import { CriarPacienteDto } from './dto/criar-paciente.dto'; // Importa o DTO de criação de paciente, define a estrutura dos dados que serão recebidos para criar um novo paciente, garante que os dados estejam no formato correto e atendam aos requisitos definidos

@Injectable()
export class PacientesService {
  private readonly colecaopaciente = 'pacientes'; //Define a constante da classe que guarda o nome da coleção no Firestore
  // Em vez de escrever string 'pacientes' em todos os métodos, possibilita usar this.colecaopaciente, se alterar o nome altera em um só lugar

  constructor(private readonly firebase: FirebaseService) {}

  // CREATE - Criar um novo paciente
  async criar(dto: CriarPacienteDto) {
    const snapshot = await this.firebase.firestore
      .collection(this.colecaopaciente)
      .where('telefone', '==', dto.telefone)
      .get();

    if (!snapshot.empty) {
      throw new ConflictException(
        `Paciente já cadastrado com telefone ${dto.telefone}`,
      );
    }

    const paciente = {
      ...dto, // ... = Spread operator, os tres pontos antes do dto copiam todos os campos do objeto dto
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const ref = await this.firebase.firestore
      .collection(this.colecaopaciente)
      .add(paciente);

    // Cria um documento com ID gerado automaticamente. Retorna uma referência com o ID criado.

    return { id: ref.id, ...paciente };
  }

  // READ ALL - Listar todos os pacientes
  async listarTodos() {
    const snapshot = await this.firebase.firestore
      .collection(this.colecaopaciente)
      .orderBy('criadoEm', 'desc') // Ordena os resultados. desc = mais recente primeiro, asc = mais antigo primeiro.
      .get();

    //Busca todos os documentos da coleção. Retorna um snapshot com array de docs.

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })); // snapshot Percorre todos os documentos e transforma cada um em um objeto com id + dados.
  }

  // READ ONE - Buscar um paciente por ID
  async buscarPorId(id: string) {
    const doc = await this.firebase.firestore
      .collection(this.colecaopaciente)
      .doc(id)
      .get();

    // .collection(nome).doc(id).get() Busca um documento específico pelo ID.

    if (!doc.exists) {
      throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
    } // Quando o NotFoundException é lançado, o NestJS automaticamente retorna um HTTP 404 com a mensagem fornecida

    return { id: doc.id, ...doc.data() };
  }

  // UPDATE - Atualizar um paciente por ID
  async atualizar(id: string, dados: Partial<CriarPacienteDto>) {
    // Partial<> torna todos os campos do DTO opcionais, permite atualizar somente um campo sem ter que inserir todos os outros campos
    await this.buscarPorId(id); // Verifica se o paciente existe antes de atualizar

    await this.firebase.firestore
      .collection(this.colecaopaciente)
      .doc(id)
      .update({
        ...dados,
        atualizadoEm: new Date().toISOString(),
      });

    // .doc(id).update(dados) Atualiza só os campos enviados, sem apagar os outros. Diferente do set() que substitui tudo.
    return this.buscarPorId(id); // retorna o paciente atualizado
  }

  // DELETE - Excluir um paciente
  async excluirPaciente(id: string) {
    await this.buscarPorId(id); // Verifica se o paciente existe antes de excluir

    await this.firebase.firestore
      .collection(this.colecaopaciente)
      .doc(id)
      .delete();

    return { mensagem: `Paciente ${id} excluído com sucesso` }; // A string com crase permite inserir variáveis com ${variavel}
  }
}
