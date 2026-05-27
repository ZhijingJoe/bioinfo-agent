/** 侧边栏 SKILLs 数据 */

export interface SkillEntry {
  name: string;
  desc: string;
  tutorial: string;
  gh: string;
}

export interface SkillGroup {
  title: string;
  repo: string;
  stars: number;
  description: string;
  installCmd: string;
  skills: SkillEntry[];
}

export interface BioSkillCategory {
  name: string;
  icon: string;
  skills: SkillEntry[];
}

export interface BioSkillsGroup {
  title: string;
  repo: string;
  stars: number;
  description: string;
  installCmd: string;
  categories: BioSkillCategory[];
}

/* ================================================================
   仓库一: Academic Research Skills (22k stars)
   ================================================================ */
export const academicResearchSkills: SkillGroup = {
  title: '学术研究流水线',
  repo: 'https://github.com/Imbad0202/academic-research-skills',
  stars: 22276,
  description:
    '覆盖从研究规划到论文发表的完整学术写作流水线。适用于 Claude Code CLI / VS Code / JetBrains 插件。AI 做你的副驾驶——查文献、整理引用、验证逻辑一致性；你专注于定义科学问题、选择方法、解读数据。',
  installCmd: '/plugin marketplace add Imbad0202/academic-research-skills',
  skills: [
    {
      name: 'academic-pipeline',
      desc: '完整的学术研究流水线：将一篇论文从构思、规划、写作到最终定稿串联为自动化流程。自动编排各阶段工具调用顺序，支持断点续跑。',
      tutorial:
        '1. 安装插件后，输入 /ars-plan 启动苏格拉底式对话，逐步梳理论文结构\n2. 用 /ars-research 执行深度文献检索\n3. 用 /ars-write 生成初稿\n4. 用 /ars-review 进行内部审稿\n5. 用 /ars-revise 根据审稿意见修改\n6. 用 /ars-finalize 格式化参考文献并输出终稿',
      gh: 'https://github.com/Imbad0202/academic-research-skills/tree/main/skills/academic-pipeline',
    },
    {
      name: 'deep-research',
      desc: '深度文献调研模块：系统性地从多个学术数据库检索、筛选、总结文献。支持 PubMed、arXiv、Semantic Scholar 等。自动生成文献综述矩阵。',
      tutorial:
        '1. 指定研究主题和关键词\n2. 工具自动跨库检索并去重\n3. 按相关性和引用量排序\n4. 生成结构化文献综述表格（作者/年份/方法/结论）\n5. 支持增量更新——运行后仅获取新增文献',
      gh: 'https://github.com/Imbad0202/academic-research-skills/tree/main/skills/deep-research',
    },
    {
      name: 'academic-paper',
      desc: '学术论文写作助手：根据研究大纲和文献调研结果，自动生成符合学术规范的论文初稿。遵循 IMRaD（Introduction, Methods, Results, Discussion）结构。',
      tutorial:
        '1. 基于 deep-research 产出的文献矩阵\n2. 提供论文大纲或研究笔记\n3. 逐节生成：引言 → 方法 → 结果 → 讨论\n4. 自动插入文献引用（BibTeX 格式）\n5. 支持 LaTeX / Word / Markdown 输出',
      gh: 'https://github.com/Imbad0202/academic-research-skills/tree/main/skills/academic-paper',
    },
    {
      name: 'academic-paper-reviewer',
      desc: '模拟同行评审：对论文初稿从方法论、逻辑、数据、语言四个维度进行系统审阅。输出结构化的审稿报告，附修改建议和评级。',
      tutorial:
        '1. 提交完整论文初稿\n2. 工具自动拆解为可审阅单元\n3. 四维度评估：方法论合理性 / 逻辑连贯性 / 数据完整性 / 语言规范性\n4. 生成审稿报告：总体评价 + 逐条建议 + 修改优先级\n5. 支持自定义审稿标准（如某期刊投稿要求）',
      gh: 'https://github.com/Imbad0202/academic-research-skills/tree/main/skills/academic-paper-reviewer',
    },
  ],
};

/* ================================================================
   仓库二: bioSkills (788 stars)
   ================================================================ */
export const bioSkills: BioSkillsGroup = {
  title: '生信分析工具集',
  repo: 'https://github.com/GPTomics/bioSkills',
  stars: 788,
  description:
    '为 AI 编程 Agent（Claude Code、OpenAI Codex、Gemini CLI 等）提供 50+ 生信子领域的专家级 SKILLs。涵盖从基础序列操作到单细胞组学、空间转录组学等前沿分析。每个 SKILL 包含代码范式、最佳实践和真实示例。',
  installCmd: 'git clone https://github.com/GPTomics/bioSkills ~/.bioskills',
  categories: [
    {
      name: '序列分析',
      icon: '🧬',
      skills: [
        { name: 'read-qc', desc: '测序数据质控：FastQC + MultiQC', tutorial: '对 FASTQ 文件执行质量评估，生成可视化报告。含 adapter 检测、GC 含量分析、碱基质量分布。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/read-qc' },
        { name: 'read-alignment', desc: '序列比对：BWA / STAR / minimap2', tutorial: 'DNA-seq 用 BWA-MEM，RNA-seq 用 STAR，长读长用 minimap2。含比对率统计与去重。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/read-alignment' },
        { name: 'sequence-io', desc: '序列读写：FASTA/FASTQ/SAM 处理', tutorial: '使用 Biopython/pysam 读写常见序列格式，批量转换、过滤、统计。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/sequence-io' },
        { name: 'sequence-manipulation', desc: '序列操作：切酶/引物设计/翻译', tutorial: '酶切位点分析、引物设计（含 Tm 计算）、序列翻译与反向互补。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/sequence-manipulation' },
        { name: 'long-read-sequencing', desc: '长读长测序：Nanopore/PacBio', tutorial: '长读长数据质控（NanoPlot）、纠错、组装流程。适用三代测序平台。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/long-read-sequencing' },
      ],
    },
    {
      name: '基因组学',
      icon: '🧫',
      skills: [
        { name: 'genome-assembly', desc: '基因组组装：SPAdes/Canu/hifiasm', tutorial: '从二代/三代 reads 出发，执行 de novo 组装，含质量评估（QUAST）和比对回贴。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/genome-assembly' },
        { name: 'genome-annotation', desc: '基因组注释：Prokka/MAKER/InterProScan', tutorial: '基因预测 + 功能注释 + 非编码 RNA 识别，输出 GFF3/GenBank 格式。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/genome-annotation' },
        { name: 'variant-calling', desc: '变异检出：GATK/DeepVariant/bcftools', tutorial: 'SNP/InDel 检出与过滤，含 VQSR 校正。支持 germline 和 somatic 模式。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/variant-calling' },
        { name: 'copy-number', desc: '拷贝数变异：CNVkit/GISTIC', tutorial: '全基因组 CNV 分析，可视化拷贝数谱，识别显著扩增/缺失区域。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/copy-number' },
        { name: 'phasing-imputation', desc: '基因型定相与填补：SHAPEIT/IMPUTE', tutorial: 'SNP phasing + 基因型填补（imputation），利用参考面板提升标记密度。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/phasing-imputation' },
      ],
    },
    {
      name: '转录组学',
      icon: '📊',
      skills: [
        { name: 'differential-expression', desc: '差异表达分析：DESeq2/edgeR/limma', tutorial: 'count 矩阵 → 归一化 → 差异检验 → 多重校正。含批次效应校正和时序 DE。子模块含 deseq2-basics, edger-basics, de-results, de-visualization, timeseries-de, batch-correction。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/differential-expression' },
        { name: 'rna-quantification', desc: 'RNA 定量：Salmon/kallisto/featureCounts', tutorial: '转录本/基因水平定量，支持有参考转录组和无参考（pseudoalignment）模式。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/rna-quantification' },
        { name: 'alternative-splicing', desc: '可变剪接分析：rMATS/SUPPA2', tutorial: '五种经典剪接事件（SE/MXE/A3SS/A5SS/RI）的差异分析及可视化。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/alternative-splicing' },
        { name: 'small-rna-seq', desc: '小 RNA 测序：miRNA/piRNA 分析', tutorial: 'miRNA 定量、靶基因预测、差异表达、功能富集。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/small-rna-seq' },
        { name: 'ribo-seq', desc: '核糖体印迹测序分析', tutorial: 'Ribo-seq reads 处理、P-site 定位、翻译效率计算。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/ribo-seq' },
      ],
    },
    {
      name: '单细胞 & 空间组学',
      icon: '🔬',
      skills: [
        { name: 'single-cell', desc: '单细胞分析：Scanpy/Seurat 全流程', tutorial: '预处理 → 降维 → 聚类 → 差异分析 → 注释。含 doublet 检测、批次整合、轨迹推断、细胞通讯。子模块：preprocessing, clustering, cell-annotation, trajectory-inference, cell-communication, multimodal-integration, scatac-analysis 等。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/single-cell' },
        { name: 'spatial-transcriptomics', desc: '空间转录组：Squidpy/Giotto', tutorial: '空间表达数据分析，含空间变量基因识别、细胞类型空间分布、邻域分析。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/spatial-transcriptomics' },
      ],
    },
    {
      name: '表观组学',
      icon: '🧪',
      skills: [
        { name: 'chip-seq', desc: 'ChIP-seq 分析：peak calling + 注释', tutorial: 'MACS2 peak calling → 注释 → 差异结合 → motif 分析。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/chip-seq' },
        { name: 'atac-seq', desc: 'ATAC-seq 分析：染色质可及性', tutorial: 'ATAC-seq 数据质控、peak calling、差异可及性分析、footprinting。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/atac-seq' },
        { name: 'methylation-analysis', desc: '甲基化分析：WGBS/RRBS/甲基化阵列', tutorial: 'BS-seq 比对、甲基化位点提取、DMR 鉴定、注释。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/methylation-analysis' },
      ],
    },
    {
      name: '多组学整合',
      icon: '🔗',
      skills: [
        { name: 'multi-omics-integration', desc: '多组学整合：MOFA/DIABLO/mixOmics', tutorial: '转录组+蛋白组+代谢组等的联合降维、特征选择、样本聚类。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/multi-omics-integration' },
        { name: 'gene-regulatory-networks', desc: '基因调控网络：SCENIC/ARACNe', tutorial: '从表达数据推断转录因子-靶基因调控关系，构建调控网络。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/gene-regulatory-networks' },
        { name: 'systems-biology', desc: '系统生物学：网络分析/通量平衡', tutorial: '代谢网络建模（FBA）、蛋白互作网络分析、网络拓扑特征。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/systems-biology' },
      ],
    },
    {
      name: '进化 & 群体遗传',
      icon: '🌳',
      skills: [
        { name: 'phylogenetics', desc: '系统发育分析：IQ-TREE/RAxML/BEAST', tutorial: '多序列比对 → 模型选择 → 建树 → 分子钟 → 祖先状态重建。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/phylogenetics' },
        { name: 'population-genetics', desc: '群体遗传学：PCA/STRUCTURE/Fst', tutorial: '群体结构推断、选择信号检测（Tajima D, iHS, XP-EHH）、有效群体大小估计。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/population-genetics' },
        { name: 'comparative-genomics', desc: '比较基因组学：直系同源/共线性', tutorial: '物种间基因家族分析、共线性检测、进化速率比较。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/comparative-genomics' },
      ],
    },
    {
      name: '蛋白质组学',
      icon: '💠',
      skills: [
        { name: 'proteomics', desc: '蛋白质组学：MaxQuant/Spectronaut', tutorial: '质谱数据处理、蛋白鉴定与定量、差异蛋白分析、PTM 鉴定。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/proteomics' },
        { name: 'structural-biology', desc: '结构生物学：AlphaFold/PyMOL', tutorial: '蛋白结构预测、分子对接、结构可视化与比较。', gh: 'https://github.com/GPTomics/bioSkills/tree/main/structural-biology' },
      ],
    },
  ],
};
