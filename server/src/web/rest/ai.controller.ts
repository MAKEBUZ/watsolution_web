import { Body, Controller, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { AiService } from '../../service/ai.service';

@ApiTags('ai')
@Controller('api/ai')
@UseInterceptors(LoggingInterceptor)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/chat')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to the WatSolution AI assistant' })
  async chat(
    @Body() body: { message: string },
    @Request() req: any,
  ): Promise<{ reply: string }> {
    return this.aiService.chat(req.user?.login ?? '', body.message);
  }

  @Post('/admin/seed-faqs')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed FAQ documents into the RAG vector index' })
  async seedFaqs(): Promise<{ indexed: number }> {
    const indexed = await this.aiService.seedFaqs();
    return { indexed };
  }
}
