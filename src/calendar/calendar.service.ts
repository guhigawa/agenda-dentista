import { Injectable, OnApplicationBootstrap, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { CriarEventoDto } from './dto/criar-evento.dto';

@Injectable()
export class CalendarService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CalendarService.name);
  private calendar!: calendar_v3.Calendar;

  constructor(private readonly config: ConfigService) {}

  onApplicationBootstrap() {
    try {
      const google_auth = new google.auth.JWT({
        email: this.config.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        key: this.config
          .get<string>('GOOGLE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'], //Escope de acesso a api e permissões
      });

      this.calendar = google.calendar({ version: 'v3', auth: google_auth });
      this.logger.log('Google Calendar inicializado com sucesso');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao incializar Google Calendar: ${err.message}`);
    }
  }
  //Create - criação do evento de na agenda
  async criarEvento(dto: CriarEventoDto): Promise<string> {
    await this.verificarDisponibilidadePorHorario(dto.dataInicio, dto.dataFim);

    const response = await this.calendar.events.insert({ //calendar.events.insert() método api da google para criar um evento 
      calendarId: this.config.get<string>('GOOGLE_CALENDAR_ID'),
      requestBody: {
        summary: dto.titulo,
        description: dto.descricao,
        start: {
          dateTime: dto.dataInicio,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: dto.dataFim,
          timeZone: 'America/Sao_Paulo',
        },
        attendees: dto.pacienteEmail
          ? [{ email: dto.pacienteEmail }]
          : undefined,
      },
    });
    const eventId = response.data.id!;
    this.logger.log(`Evento criado com sucesso: ${eventId}`);
    return eventId;
  }

  // READ - Listagem de eventos em um dia
  async listarEventosDoDia(data: string): Promise<calendar_v3.Schema$Event[]> {
    const inicio = `${data}T00:00:00-03:00`;
    const fim = `${data}T23:59:59-03:00`;

    const response = await this.calendar.events.list({ // calendar.events.list() método para retornar array de eventos
      calendarId: this.config.get<string>('GOOGLE_CALENDAR_ID'),
      timeMin: inicio,
      timeMax: fim,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  // READ - Verificação de disponibilidade de horário
  async verificarDisponibilidade(data: string): Promise<string[]> {
    const eventos = await this.listarEventosDoDia(data);
    const horariosOcupados = eventos.map(e => e.start?.dateTime || '');

    // Horarios de funcionamento definidos 8 - 18
    const todosHorarios = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];

    return todosHorarios.filter(horario => {
      const horarioISO = `${data}T${horario}:00-03:00`;
      return !horariosOcupados.includes(horarioISO);
    });
  }

  async verificarDisponibilidadePorHorario(
    inicio: string,
    fim: string,
  ): Promise<void> {
    const data = inicio.split('T')[0]; // "2026-06-10T14:00:00-03:00" → "2026-06-10"
    const eventosNoDia = await this.listarEventosDoDia(data);

    const horarioOcupado = eventosNoDia.some(evento => {
      const eventoInicio = new Date(evento.start?.dateTime || '');
      const eventoFim = new Date(evento.end?.dateTime || '');
      const novoInicio = new Date(inicio);
      const novoFim = new Date(fim);

      // Sobreposição: novo começa antes do existente terminar
      //               E novo termina depois do existente começar
      return novoInicio < eventoFim && novoFim > eventoInicio;
    });

    if (horarioOcupado) {
      throw new ConflictException(
        'Já existe uma consulta agendada nesse horário',
      );
    }
  }

  // UPDATE - atualização de evento
  async atualizarEvento(
    eventId: string,
    dados: Partial<CriarEventoDto>,
  ): Promise<void> {
    if (dados.dataInicio && dados.dataFim) {
      await this.verificarDisponibilidadePorHorario(
        dados.dataInicio,
        dados.dataFim,
      );
    }

    await this.calendar.events.patch({
      calendarId: this.config.get<string>('GOOGLE_CALENDAR_ID'),
      eventId,
      requestBody: {
        summary: dados.titulo,
        description: dados.descricao,
        start: dados.dataInicio
          ? {
              dateTime: dados.dataInicio,
              timeZone: 'America/Sao_Paulo',
            }
          : undefined,
        end: dados.dataFim
          ? {
              dateTime: dados.dataFim,
              timeZone: 'America/Sao_Paulo',
            }
          : undefined,
      },
    });

    this.logger.log(`Evento atualizado: ${eventId}`);
  }

  // DELETE - exclusão do evento
  async cancelarEvento(eventId: string): Promise<void> {
    await this.calendar.events.delete({ // .delete() para deletar evento
      calendarId: this.config.get<string>('GOOGLE_CALENDAR_ID'),
      eventId,
    });

    this.logger.log(`Evento cancelado: ${eventId}`);
  }
}
