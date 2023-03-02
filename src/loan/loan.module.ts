import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { PersonModule } from 'src/person/person.module';
import { CopyBookModule } from 'src/copy-book/copy-book.module';
import { LoanStateModule } from 'src/loan-state/loan-state.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Loan]),
    PersonModule,
    LoanStateModule,
    CopyBookModule
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports:[ LoanService ]
})
export class LoanModule {}
