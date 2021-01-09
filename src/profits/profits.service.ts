import * as fse from 'fs-extra'
import * as path from 'path'
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios'
import * as cheerio from 'cheerio'
import xlsx from 'node-xlsx';
import * as moment from 'moment'
import 'dotenv/config'

const port = process.env.PORT
const outputFolder = process.env.OUTPUT_FOLDER || path.resolve(__dirname, '../data/excel')
const outputPath = path.resolve(__dirname, '../data', outputFolder)
const filename = process.env.FILENAME || 'excel'
const fileTitle = process.env.FILE_TITLE || 'my excel'
@Injectable()
export class ProfitsService {
    private readonly logger = new Logger(ProfitsService.name);

    constructor() {
        this.init()
    }

    init() {
      this.crawlRequest()
    }

    async crawlRequest() {
        const url = 'http://quotes.money.163.com/f10/zycwzb_600519.html#01c01'
        axios.get(url).then(res => {
            this.logger.log('开始爬取数据...');
            const data = this.loadHtmlContent(res.data)
            this.logger.log('数据爬取完成。。。');
            return data
        }).then(data => {
            this.logger.log('开始导出数据为excel文件...');
            this.exportToCsv(data)
        })
    }

    loadHtmlContent(data) {
       const $ = cheerio.load(data)
       const $table = $('.scr_table')
       const $ths = $table.find('tbody tr th')
       const theadData = []
       $ths.each((i, elem) => {
        theadData.push($(elem).text())
       })
       const $profitsTr = $table.find('tbody tr').eq(11)
       const $tds = $profitsTr.find('td')
       const profitsData = []
       $tds.each((i, elem) => {
        profitsData.push($(elem).text())
       })
       return {
        theadData: theadData,
        tbodyData: profitsData
       }
    }

    exportToCsv(data) {
       const { theadData,  tbodyData} = data
       const col1 = '报告日期'
       const col2 = '净利润(扣除非经常性损益后)(万元)'
       const bufferData = xlsx.build([
           {
               name: fileTitle,
               data: [[col1].concat(theadData), [col2].concat(tbodyData)]
           }
       ])
       const date = moment().format('MM-DD_HH:mm:ss')
       const execName = `${filename}-${date}.xlsx`
       const outputFile = path.join(outputPath, execName)
       if (!fse.pathExistsSync(outputPath)) {
          fse.mkdirpSync(outputPath)
       }
       fse.outputFile(
          outputFile,
          bufferData,
          'utf-8',
          (err) => {
             if(!err) {
               this.logger.log('文件生成成功')
               this.logger.log(`文件生成地址：${outputFile}`)
               this.logger.log(
                `点击 http://127.0.0.1:${port}/data/${outputFolder}/${encodeURIComponent(
                   execName,
                )} 进行下载`,
              );
             }
          }
       )
    }
}
