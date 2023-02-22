import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationStateDto } from './dto/create-reservation-state.dto';
import { ReservationState } from './entities/reservation-state.entity';

@Injectable()
export class ReservationStateService {
  
  constructor(
    @InjectRepository(ReservationState) private reservationStateRepository:Repository<ReservationState>
  ){}

  async create(createReservationStateDto: CreateReservationStateDto) {
    try{
      return await this.reservationStateRepository.save(createReservationStateDto);
    }catch(exception){
      const { code } = exception;
      if(code === 'ER_DUP_ENTRY')
        throw new BadRequestException(`Exist reservationState with name ${createReservationStateDto.name}`);
    }
    
  }

  findAll() {
    return this.reservationStateRepository.find();
  }
  
  async findOneById(id: string){
    const reservationState = await this.reservationStateRepository.findOneBy({id});
    if(reservationState)
      return reservationState;
    throw new BadRequestException(`Not exist reservationState with id: ${id}`);
  }

}
