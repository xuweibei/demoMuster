
import React from 'react'; 
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon, 
} from 'antd';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import { loadDictionary } from '@/actions/dic';

import { env } from '@/api/env'; 
import { TwoDimensionalNew,TwoDimensionalImg,TwoDimensionalBatchExport } from '@/actions/base';

import ContentBox from '@/components/ContentBox';
import moment from 'moment';
class LookDetailDetail extends React.Component {
  constructor(props) {
    super(props); 
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      dataModel: props.currentDataModel,
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
      }, 
      data: [],
      totalRecord: 0,
      loading: false,
      dic_exam_batch: [],
      TImg:''
    };

  }
  
  
  componentWillMount() {  
    this.fetch();
    this.fetchImg();
  }
  compoentDidMount() {
    
  }
  //检索数据
  fetch() { 
    this.props.TwoDimensionalNew({detailId:this.props.currentDataModel.courseArrangeDetailId}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({ 
          dataModel:data.data, 
        })
      }
      else { 
        message.error(data.message);
      }
    })
  }
  //检索数据
  fetchImg() { 
    this.props.TwoDimensionalImg({detailId:this.props.currentDataModel.courseArrangeDetailId}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') { 
        this.setState({
          TImg:data.data 
        })
      }
      else { 
        message.error(data.message);
      }
    })
  }
  //检索数据 
  
  onCancel = () => {
    this.props.viewCallback();
  }  
  doPrint=(id)=>{
    const el = document.getElementById(id);
    const iframe = document.createElement('IFRAME');
    let doc = null;
    iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:500px;top:500px;');
    document.body.appendChild(iframe);
    doc = iframe.contentWindow.document;
    let a = this.state.TImg; 
    // 引入打印的专有CSS样式，根据实际修改
    // doc.write('<LINK rel="stylesheet" type="text/css" href="css/print.css">');
    doc.write(`<img style='width:500px;height:500px;margin: auto;position: absolute; top: 0; left: 0; right: 0; bottom:0;' src='${env.serverURL+a}'/>`); 
    doc.close();
    // 获取iframe的焦点，从iframe开始打印
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    if (navigator.userAgent.indexOf("MSIE") > 0)
    {
        document.body.removeChild(iframe);
    }
  }
  Derived = () => {
    this.props.TwoDimensionalBatchExport({detailIds:this.props.currentDataModel.courseArrangeDetailId}).payload.promise.then((response) => {
      let data = response.payload.data;  
        if(data.state == 'success'){ 
          this.download({ filePath: data.data })
          this.setState({
            UserSelecteds:[]
          })
        }else{
          message.error(data.msg)
        }
      }
    )
  }
  download = (option) => {
    
    let apiUrl  = '/edu/file/getFile';
    let options = option ? option : this.props.options || [];//获取参数
    let { serverURL, getToken } = env;
    var divElement = document.getElementById("downloadDiv");
    var downloadUrl = `${serverURL}${apiUrl}`;
    var params = {
      token: getToken(),
      ...options
    }
    
    ReactDOM.render(
      <form action={downloadUrl} method={'post'}>
        {Object.keys(params).map((key, index) => {
          if(moment.isMoment(params[key])){//针对日期格式进行转换
            params[key] = formatMoment(params[key])
          }
          return <input name={key} type="hidden" value={params[key]} />
        })
        }
      </form>,
      divElement
    )
    ReactDOM.findDOMNode(divElement).querySelector('form').submit();
    ReactDOM.unmountComponentAtNode(divElement);
  }
  render() {  
    let block_content = <div></div>
    switch (this.state.editMode) { 
      case 'Manage':
      default:
 
      let extendButtons = []; 
      extendButtons.push(<Button onClick={this.Derived} icon="printer" className="button_dark" >导出</Button>);
      extendButtons.push(<Button onClick={this.onCancel} icon="rollback" className="button_dark" >返回</Button>);
        block_content = (
          <div ref='allDom'>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons,'r','t')}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="开课计划"
                        >
                          { this.state.dataModel.courseplanBatchName }

                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目"
                        >
                         { this.state.dataModel.itemName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="教学点"
                        >
                            { this.state.dataModel.teachCentername }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="科目"
                        >
                            { this.state.dataModel.courseCategoryName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="课程班名称"
                        >
                            { this.state.dataModel.courseplanName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="讲师"
                        >
                            { this.state.dataModel.teacherName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="上课日期"
                        >
                            { timestampToTime(this.state.dataModel.courseDate) }
                        </FormItem>
                    </Col>
                    <Col span={12}></Col>  
                    {/* <!--startprint--> */}
                    <p style={{width:'100%',textAlign:'center',fontSize:'20px' }}>考勤二维码：</p>
                    <img id='billDetails' ref='Printing' style={{width:'300px',height:'300px',margin:'0 auto 30px'}} src={env.serverURL+this.state.TImg}/>
                    {/* <!--endprint--> */}
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div id='downloadDiv' style={{ display: 'none' }}></div>
            <div className="space-default"></div>
            <div className="search-result-list"> 
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(LookDetailDetail);

const mapStateToProps = (state) => {
  console.log(state)
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    TwoDimensionalNew: bindActionCreators(TwoDimensionalNew, dispatch),
    TwoDimensionalImg: bindActionCreators(TwoDimensionalImg, dispatch),
    TwoDimensionalBatchExport: bindActionCreators(TwoDimensionalBatchExport, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
