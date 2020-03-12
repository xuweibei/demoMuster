 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
   Form, Row, Col, Select,DatePicker
} from 'antd';
const FormItem = Form.Item; 
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';  

const Option = Select.Option;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, 
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';
import moment from 'moment'; 
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const searchFormItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 12 },
}
class OriginalDivision extends React.Component {
  constructor() {
    super();
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = { 
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: { 
        ysBranchId: '', //公司
        branchId: '',//分部ID
        actType: '',
        regSourse: '',
        orderState: '',
        createStart: '',
        createEnd: '',
        actStart: '',
        actEnd:''
      }, 
    };
  }
  componentWillMount() { 
    //载入需要的字典项: 
    this.loadBizDictionary(['activity_type','reg_source']); 
  } 
  componentWillUnMount() {
  }
  
  Original = (value,data) => { 
    this.state.pagingSearch[data] = value;
    let createStart = this.state.pagingSearch.createStart;
    if(Array.isArray(createStart)){
      this.state.pagingSearch.createStart = formatMoment(createStart[0]);
      this.state.pagingSearch.createEnd = formatMoment(createStart[1]);
    } 
    let actStart = this.state.pagingSearch.actStart;
    if(Array.isArray(actStart)){
      this.state.pagingSearch.actStart = formatMoment(actStart[0]);
      this.state.pagingSearch.actEnd = formatMoment(actStart[1]);
    } 
    this.setState({
      pagingSearch:this.state.pagingSearch
    })
  }
  render() { 
    let block_content = <div></div>
    let that = this;
    switch (this.state.editMode) { 
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = []; 
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/stuAct/export'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'l','r')}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'原始分部'} >
                        {getFieldDecorator('ysBranchId', { initialValue: this.state.pagingSearch.ysBranchId })(
                          <SelectFBOrg onChange = {(value)=>that.Original(value,'ysBranchId')} scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'目前分部'} >
                        {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                          <SelectFBOrg onChange = {(value)=>that.Original(value,'branchId')} scope='all' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'活动类型'} >
                        {getFieldDecorator('actType', { initialValue: dataBind(this.state.pagingSearch.actType) })(
                          <Select
                            onChange = {(value)=>that.Original(value,'actType')} 
                          >
                            <Option value="">全部</Option>
                            {this.state.activity_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生来源'} >
                        {getFieldDecorator('regSourse', { initialValue: dataBind(this.state.pagingSearch.regSourse) })(
                          <Select 
                            onChange = {(value)=>that.Original(value,'regSourse')} 
                          >
                            <Option value="">全部</Option>
                            {this.state.reg_source.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生目前情况'} >
                        {getFieldDecorator('isStudy', { initialValue: dataBind(this.state.pagingSearch.isStudy) })(
                          <Select
                          onChange = {(value)=>that.Original(value,'isStudy')} 
                          >
                            <Option value="">全部</Option> 
                            <Option value="1">在读</Option> 
                            <Option value="0">在职</Option>  
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生订单情况'} >
                        {getFieldDecorator('orderState', { initialValue: dataBind(this.state.pagingSearch.orderState) })(
                          <Select
                          onChange = {(value)=>that.Original(value,'orderState')} 
                          >
                            <Option value="">全部</Option> 
                            <Option value="1">无订单</Option> 
                            <Option value="2">已下单未缴费</Option>  
                            <Option value="3">已下单已缴费</Option>  
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                          {...searchFormItemLayout}
                          label="学生创建日期">
                          {getFieldDecorator('createStart', { initialValue:this.state.pagingSearch.createStart?[moment(this.state.pagingSearch.createStart,dateFormat),moment(this.state.pagingSearch.createEnd,dateFormat)]:[] })(
                              <RangePicker onChange = {(value)=>that.Original(value,'createStart')}  style={{width:220}}/>
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                          {...searchFormItemLayout}
                          label="首次参加活动开始日期">
                          {getFieldDecorator('actStart', { initialValue:this.state.pagingSearch.actStart?[moment(this.state.pagingSearch.actStart,dateFormat),moment(this.state.pagingSearch.actEnd,dateFormat)]:[] })(
                              <RangePicker onChange = {(value)=>that.Original(value,'actStart')}  style={{width:220}}/>
                          )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox> 
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OriginalDivision);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth; 
  return { Dictionarys,currentUser};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
 