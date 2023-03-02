import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonStateDto } from './dto/create-person-state.dto';
import { PersonState } from './entities/person-state.entity';

@Injectable()
export class PersonStateService {

  constructor(
    @InjectRepository(PersonState) private personStateRepository: Repository<PersonState>,
    private configService: ConfigService
  ) { }

  async create(createPersonStateDto: CreatePersonStateDto) {
    try {
      return await this.personStateRepository.save(createPersonStateDto);
    } catch (exception) {
      const { code } = exception;
      if (code === 'ER_DUP_ENTRY')
        throw new BadRequestException(`personState:  ${createPersonStateDto.name} exist in DB`);
    }
  }
  
  async findIdByName(name: string){
    const personState = await this.personStateRepository.findOneBy({name});
    if(personState)
      return personState.id;
      throw new BadRequestException(`Not exist personState with name: ${name}`);
  }

  async isAcceptable(id: string){
    const personState = await this.findOneById(id);
    return personState.name === this.configService.get<string>('ACCEPTABLE_PERSON_STATE')   
  }

  async findOneById(id: string) {
    const personState = await this.personStateRepository.findOneBy({ id });
    if (personState)
      return personState;
    throw new BadRequestException(`Not exist personState with id: ${id}`);
  }

  findAll() {
    try {
      return this.personStateRepository.find();
    } catch (exception) {
      throw new InternalServerErrorException(`Find All fail exception: ${exception.message}`)
    }

  }

}
