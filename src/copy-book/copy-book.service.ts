import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/book.service';
import { CopyBookStateService } from 'src/copy-book-state/copy-book-state.service';
import { Repository } from 'typeorm';
import { CreateCopyBookDto } from './dto/create-copy-book.dto';
import { UpdateCopyBookDto } from './dto/update-copy-book.dto';
import { CopyBook } from './entities/copy-book.entity';

@Injectable()
export class CopyBookService {

  constructor(
    @InjectRepository(CopyBook) private copyBookRepository: Repository<CopyBook>,
    private bookService: BookService,
    private copyBookStateService: CopyBookStateService,
    private configService: ConfigService
  ) { }

  async create(createCopyBookDto: CreateCopyBookDto) {
    const { bookId } = createCopyBookDto;
    await this.bookService.findOneById(bookId);
    try {
      return await this.copyBookRepository.save({ book: { id: bookId } });
    } catch (exception) {
      throw new InternalServerErrorException(`Error in create copyBook: ${exception.message}`);
    }

  }
  
  async isAvailable(id: string){
    const copyBook = await this.findOneById(id);
    const { copyBookState } = copyBook;
    if(copyBookState.name !== this.configService.get<String>('AVAILABLE_COPY_BOOK_STATE'))
      throw new ForbiddenException(`CopyBook not is available for loan`);

  }

  async findAllByBookId(id: string) {
    await this.bookService.findOneById(id);
    return await this.copyBookRepository.findBy({ book: { id } });
  }

  async findAllByBookCode(code: string) {
    await this.bookService.findOneByCode(code);
    return await this.copyBookRepository.findBy({ book: { code } });
  }

  async findOneById(id: string) {
    const copyBook = await this.copyBookRepository.findOneBy({ id, book: true });
    if (copyBook)
      return copyBook;
    throw new BadRequestException(`Not exist copyBook with id: ${id}`);
  }
  
  async loanCopyBook(id: string){
    const copyBookStateId = await this.copyBookStateService.findIdByName(this.configService.get<string>('LOAN_COPY_BOOK_STATE'));
    this.update(id, { copyBookStateId });
  }

  async update(id: string, updateCopyBookDto: UpdateCopyBookDto) {
    await this.findOneById(id);
    try {
      return await this.copyBookRepository.update({ id }, {
        copyBookState: {
          id: updateCopyBookDto.copyBookStateId
        }
      });
    } catch (exception) {
      throw new InternalServerErrorException(`Error in update copyBook: ${exception.message}`);
    }

  }
}
