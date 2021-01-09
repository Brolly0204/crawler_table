import * as fse from 'fs-extra'
import * as path from 'path'
import { Injectable } from '@nestjs/common';
import axios from 'axios'
import * as cheerio from 'cheerio'
import xlsx from 'node-xlsx';
import * as moment from 'moment'
import 'dotenv/config'

const outputFolder = process.env.OUTPUT_FOLDER || path.resolve(__dirname, './data/exec')
const outputPath = path.resolve(__dirname, './data', outputFolder)
const filename = process.env.FILENAME || 'exec'
const fileTitle = process.env.FILE_TITLE || 'my exec'
@Injectable()
export class ProfitsService {
    constructor() {
        this.init()
    }

    init() {
      this.crawlRequest()
    }

    async crawlRequest() {
        const url = 'http://quotes.money.163.com/f10/zycwzb_600519.html#01c01'
        axios.get(url).then(res => {
            const data = this.loadHtmlContent(res.data)
            return data
        }).then(data => {
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
          'utf-8'
       )
    }
}
