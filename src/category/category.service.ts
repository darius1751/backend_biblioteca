import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generatePagination } from 'src/common/helpers/generatePagination';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {

  constructor(@InjectRepository(Category) private categoryRepository:Repository<Category>){}

  async create(createCategoryDto: CreateCategoryDto) {
    try{
      return await this.categoryRepository.save(createCategoryDto);
    }catch(exception){
      throw new InternalServerErrorException(`Error in create category ${exception.message}`);
    }
  }

  async findAll(skip: number, take: number) {
    const [categories, totalRegisters] = await this.categoryRepository.findAndCount({
      skip,
      take,
      order:{
        name:'ASC'
      }
    });
    return { categories, pagination: generatePagination(skip, take, totalRegisters)}
    
  }

  

  async findOneById(id: string) {
    const category = await this.categoryRepository.findOneBy({id});
    if(category)
      return category;
    throw new BadRequestException(`Not exist category with id: ${id}`);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOneById(id);
    try{
      return await this.categoryRepository.update({id},updateCategoryDto);
    }catch(exception){ 
      throw new InternalServerErrorException(`Error in update category, exception: ${exception.message}`);
    }
    
  }

}
