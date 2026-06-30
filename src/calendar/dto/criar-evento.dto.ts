import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CriarEventoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsDateString()
  @IsNotEmpty()
  dataInicio!: string; // ISO: "2026-06-10T14:00:00-03:00"

  @IsDateString()
  @IsNotEmpty()
  dataFim!: string; // ISO: "2026-06-10T15:00:00-03:00"

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  pacienteEmail?: string;
}
