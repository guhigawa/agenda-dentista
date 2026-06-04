// DTO - Data Transfer Object - define a estrutura dos dados que serão enviados ou recebidos pela aplicação
// Para usar a DTO é preciso instalar a biblioteca class-validator e class-transformer - npm install class-validator class-transformer
// class-validator é usada para validar os dados recebidos, garantindo que eles estejam no formato correto e atendam aos requisitos definidos
// class-transformer é usada para converter o JSON recebido na requisição em uma instância do DTO para que o class-validator consiga validar.
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CriarPacienteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;
  // ! garante ao TypeScript que ele sempre vai ter valor quando usado

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsEmail()
  @IsOptional()
  email?: string; //Campos opcionais recebem ? para evitar que o TypeScript acuse erro de que o campo pode ser undefined

  @IsDateString()
  @IsOptional()
  dataNascimento?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
