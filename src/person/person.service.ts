import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialService } from 'src/credential/credential.service';
import { loginCredentialDto } from 'src/credential/dto/login-credential.dto';
import { generatePagination } from 'src/helpers/generatePagination';
import { Repository } from 'typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';

@Injectable()
export class PersonService {

  constructor(
    @InjectRepository(Person) private personRepository: Repository<Person>,
    private credentialService: CredentialService,
    private configService: ConfigService
  ) { }

  async create(createPersonDto: CreatePersonDto) {

    const { credential } = createPersonDto;
    const credentialId = await this.credentialService.create(credential);

    try {

      return await this.personRepository.save({
        ...createPersonDto,
        credential: { id: credentialId }
      });
    } catch (exception) {
      throw new InternalServerErrorException(`Error in create person, Exception : ${exception.message}`);
    }
  }

  async login(loginCredentialDto: loginCredentialDto) {

    const { id, token } = await this.credentialService.login(loginCredentialDto);
    const person = await this.findOneByCredentialId(id);
    return { token, person }
  }

  async isActive(personId: string){
    const person = await this.findOneById(personId);
    const { personState } = person;
    if(personState.name != this.configService.get<String>('ACCEPTABLE_PERSON_STATE'))
      throw new ForbiddenException(`Not is active person state`);
  }

  public async findOneByDocumentIdentifier(documentIdentifier: string) {

    const person = this.personRepository.findOneBy({ documentIdentifier })
    if (person)
      return person;
    throw new BadRequestException(`Not exist person with documentIdentifier: ${documentIdentifier}`);
  }

  async findAll(skip: number, take: number) {
    const [persons, totalRegisters] = await this.personRepository.findAndCount({
      skip, take, order: {
        name: 'ASC'
      }
    });
    return {
      persons,
      pagination: generatePagination(skip, take, totalRegisters)
    }
  }


  public async findOneById(id: string) {
    const person = this.personRepository.findOneBy({ id })
    if (person)
      return person;
    throw new BadRequestException(`Not exist person with id: ${id}`);
  }


  async update(id: string, updatePersonDto: UpdatePersonDto) {
    await this.findOneById(id);
    try {
      return this.personRepository.update({ id }, updatePersonDto);
    } catch (exception) {
      throw new InternalServerErrorException(`Error in update person with id: ${id}`);
    }
  }
  private async findOneByCredentialId(id: string) {

    const person = await this.personRepository.findOneBy({ credential: { id } })
    if (person)
      return person;
    throw new BadRequestException(`Error not exist credentialId`);
  }
}
