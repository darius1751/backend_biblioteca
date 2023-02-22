import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CopyBookService } from 'src/copy-book/copy-book.service';
import { DevolutionStateService } from 'src/devolution-state/devolution-state.service';
import { LoanService } from 'src/loan/loan.service';
import { PersonService } from 'src/person/person.service';
import { Repository } from 'typeorm';
import { CreateDevolutionDto } from './dto/create-devolution.dto';
import { UpdateDevolutionDto } from './dto/update-devolution.dto';
import { Devolution } from './entities/devolution.entity';

@Injectable()
export class DevolutionService {

  constructor(
    @InjectRepository(Devolution) private devolutionRepository: Repository<Devolution>,
    private loanService: LoanService,
    private devolutionStateService: DevolutionStateService,
    private personService: PersonService,
    private copyBookService: CopyBookService
  ) { }

  async create(createDevolutionDto: CreateDevolutionDto) {
    const { loanId, devolutionStateId, annotations } = createDevolutionDto;
    const loan = await this.loanService.findOneById(loanId);
    const devolutionState = await this.devolutionStateService.findOneById(devolutionStateId);
    try {
      return await this.devolutionRepository.save({ 
        annotations, 
        loan: {
          id: loanId 
        }, 
        devolutionState: {
          id: devolutionStateId
        } 
      });
    } catch (exception) {
      throw new InternalServerErrorException(`Error in create devolution, exception: ${exception.message}`);
    }

  }

  findAll(skip: number, take: number) {
    return this.devolutionRepository.find({
      skip,
      take,
      order: {
        createdAt: 'ASC'
      }
    });
  }

  async findAllByPersonId(id: string, skip: number, take: number){
    await this.personService.findOneById(id);
    try{
      return this.devolutionRepository.find({
        skip,
        take,
        where:{
          loan:{ person:{ id } }
        }
      })
    }catch(exception){
      throw new InternalServerErrorException(`Error in findAllByPersonId devolution: ${exception.message}`);
    }
  }

  async findOneById(id: string) {
    const devolution = await this.devolutionRepository.findOneBy({ id });
    if (devolution)
      return devolution;
    throw new BadRequestException(`Not exist devolution with id: ${id}`);

  }

  async update(id: string, updateDevolutionDto: UpdateDevolutionDto) {
    await this.findOneById(id)
    try{
      const { annotations } = updateDevolutionDto;
      return await this.devolutionRepository.update({id}, { 
        annotations
      });
    }catch(exception){
      throw new InternalServerErrorException(`Error in update devolution: ${exception.message}`);
    }    
  }
  
}
