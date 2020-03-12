

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Select,Input,DatePicker,Table,Pagination,Button,Modal, message } from 'antd';
const FormItem = Form.Item;  
const confirm = Modal.confirm; 
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic'; 
import ContentBox from '@/components/ContentBox';
import { dataBind,timestampToTime,formatMoment  } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import { examBatchSelectByItem } from '@/actions/base';
import SelectItem from '@/components/BizSelect/SelectItem';
import FileDownloader from '@/components/FileDownloader';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';  
import { GoodStudentInquiryList,ResultInputListSave } from '@/actions/stuService'; 
import DropDownButton from '@/components/DropDownButton';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents'; 
import Result from './Result';
 
class ExclusiveUniformManagement extends React.Component {
        constructor(){
            super()
            this.onSearch = onSearch.bind(this);
            this.loadBizDictionary = loadBizDictionary.bind(this);
            this.onPageIndexChange = onPageIndexChange.bind(this);
            this.onShowSizeChange = onShowSizeChange.bind(this);
            this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
            this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
            this.onToggleSearchOption = onToggleSearchOption.bind(this);
            this.state = { 
                dic_exam_batch:[],
                pagingSearch:{
                    pageSize:10,
                    currentPage:1,
                    teachCenterId:'',
                    itemId:'',
                    examBatchId:'', 
                    branchId:'',
                    isGrant:'',
                    startApplyDate:'',
                    endApplyDate:''
                }, 
            }
        }
        componentWillMount(){
            this.loadBizDictionary(['sex'])
            this.ExaminationNew();
            // this.onSearch(); 
        } 
            
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;     
    
            let startApplyDate = condition.startApplyDate;
            if(Array.isArray(startApplyDate)){
                condition.startApplyDate = formatMoment(startApplyDate[0])
                condition.endApplyDate = formatMoment(startApplyDate[1])
            }
            this.setState({ loading: true });
            this.props.GoodStudentInquiryList(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                    if(data.state == 'success'){
                        this.setState({
                            pagingSearch: condition,
                            data_list: data.data,
                            totalRecord: data.totalRecord,
                        })
                    }else{
                        message.error(data.msg);
                    }
                    this.setState({
                        loading:false
                    })
                }
            ) 
        }
        //考季随着项目的变化而变化
        ExaminationNew = (value) => {
            this.props.examBatchSelectByItem(value).payload.promise.then((response) => {
                let data = response.payload.data;
                if(data.state === 'success'){
                  var list = [];
                  data.data.map(item => {
                    list.push({value: item.examBatchId, title: item.examBatchName});
                  })
                //   if(list.length){
                //       this.state.pagingSearch.examBatchId = list[0].value;
                //   }
                  this.setState({
                    dic_exam_batch: list
                  })
                }
              });
        }
        columns = [
            {
                title:'分部',
                fixed:'left',
                dataIndex:'branchName', 
                width:'120'
            },
            {
                title:'项目', 
                dataIndex:'itemName', 
                width:'120'
            },
            {
                title:'考季',
                dataIndex:'examBatchName', 
                width:'120'
            }, 
            {
                title:'教学点',
                dataIndex:'teachCenterName', 
                width:'120'
            }, 
            {
                title:'学生姓名',
                dataIndex:'studentName', 
                width:'120',
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
                    </span>
                }
            },
            {
                title:'手机号',
                dataIndex:'mobile', 
                width:'120'
            },
            {
                title:'首次考试通过科目',
                dataIndex:'firstPassExamCourseCategoryName',  
            }, 
            {
                title:'附件',
                dataIndex:'fileUrl', 
                width:'120',
                render: (text,record) => {
                    if(record.fileUrl!=null && record.fileUrl != ''){
                        return <FileDownloader
                            apiUrl={'/edu/file/getFile'}//api下载地址
                            method={'post'}//提交方式
                            options={{ filePath: record.fileUrl }}//提交参数
                            title={'附件'}
                        >
                        </FileDownloader>
                    }else{
                        return '';
                    }
                }
            },
            {
                title:'申请日期',
                dataIndex:'examDate', 
                width:'120',
                render:(text,record)=>{
                    return timestampToTime(record.applyDate)
                }
            },
            {
                title:'申请人', 
                dataIndex:'applyUserName', 
                width:'160'
            },
            {
                title:'审核日期',
                dataIndex:'auditDate', 
                width:'120',
                render:(text,record)=>{
                    return timestampToTime(record.auditDate)
                }
            },
            {
                title:'审核人', 
                dataIndex:'auditUName', 
                width:'160'
            },
            {
                title:'奖学金是否发放', 
                dataIndex:'isGrantName'
            },
            {
                title:'操作',
                fixed:'right', 
                width:'120',
                render:(text,record)=>{
                    return  <DropDownButton>
                                <Button loading={this.state.loading} icon="align-center" onClick={()=>this.onLookView('View',record)}>查看</Button>
                            </DropDownButton>
                }
            }
        ] 
        //浏览视图
        onLookView = (op, item) => {
            this.setState({
                editMode: op,//编辑模式
                currentDataModel: item,//编辑对象
            });
    
        };
        //视图回调
        onViewCallback = (data) => { 
            if(data){
                this.onSearch(); 
                this.setState({
                    currentDataModel: null, 
                    editMode: 'Manage',
                    UserSelecteds:[],
                    selectDataList:[],
                    selectedRowKeys:[]
                })
            }else{
                this.setState({ currentDataModel: null, editMode: 'Manage' }) 
            }
        } 
        render(){

            const { getFieldDecorator } = this.props.form;
            let black_content = <div></div>; 
            switch(this.state.editMode){
                case 'ViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'View':
                    black_content = <Result viewCallback={this.onViewCallback} {...this.state}/>
                break;
                default: 
                let extendButtons = [];
                extendButtons.push( 
                    <FileDownloader
                        apiUrl={'/edu/goodStudent/exportGoodStudentList'}//api下载地址
                        method={'post'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出'}
                    >
                    </FileDownloader>); 
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed && 
                                <Form
                                    className='search-form'
                                >
                                    <Row gutter = {24} type='flex'>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'项目'}>
                                                {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId
                                                })(
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={false}
                                                    hidePleaseSelect={false}
                                                    isFirstSelected={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.state.pagingSearch.courseCategoryId = '';
                                                        // this.ExaminationNew(value)
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置科目项 */ }
                                                            this.props.form.resetFields(['courseCategoryId']);
                                                            this.onSearch();
                                                        }, 500);
                                                    }}
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'考季'}
                                            >
                                            {getFieldDecorator('examBatchId',{initialValue:this.state.pagingSearch.examBatchId})(
                                                <Select defaultValue={dataBind(this.state.pagingSearch.examBatchId)}>
                                                    <Option value=''>全部</Option>
                                                    {this.state.dic_exam_batch.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="分部">
                                                {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                                <SelectFBOrg  scope='my'  hideAll={false}  onSelectChange={(value, name) => {
                                                    var branchId = null;
                                                    if(value){
                                                        branchId = value;
                                                    }
                                                    this.state.pagingSearch.teachCenterId = '';  
                                                    this.setState({branchId: branchId,pagingSearch: this.state.pagingSearch});
                                                    setTimeout(() => {
                                                        {/* 重新重置教学点 */ }
                                                        this.props.form.resetFields(['teachCenterId']); 
                                                    }, 500);
                                                    }}
                                                />
                                                )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'教学点'}
                                            >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser branchId = {this.state.branchId} />
                                            )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="申请时间">
                                                {getFieldDecorator('startApplyDate', { initialValue: this.state.pagingSearch.startApplyDate?[moment(this.state.pagingSearch.startApplyDate,dateFormat),moment(this.state.pagingSearch.endApplyDate,dateFormat)]:[]})(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'奖学金发放'}
                                            >
                                                {getFieldDecorator('isGrant',{initialValue:this.state.pagingSearch.isGrant})(
                                                   <Select>
                                                       <Option value=''>全部</Option>
                                                       <Option value='1'>已发放</Option>
                                                       <Option value='0'>未发放</Option>
                                                   </Select>
                                                )}
                                            </FormItem>
                                        </Col> 
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        <div className='space-default'></div>
                        <div className='search-result-list'>
                            <Table 
                                columns = {this.columns}
                                loading = {this.state.loading}
                                pagination = {false}
                                dataSource = {this.state.data_list}
                                bordered
                                rowKey={record=>record.studentPayfeeId}
                                scroll={{x:2000}}
                                rowClassName={record=>record.zbPayeeTypeIsEquals == false?'highLight_column':''} 
                            />
                            <div className='space-default'></div>
                            <div calssName='search-paging'>
                                <Row justify="space-between" align="middle" type="flex"> 
                                </Row>
                                <Row justify="end" align="middle" type="flex"> 
                                    <Col span={24} className='search-paging-control'>
                                        <Pagination 
                                            showSizeChanger
                                            current = {this.state.pagingSearch.currentPage}
                                            defaultPageSize = {this.state.pagingSearch.pageSize}
                                            pageSize = {this.state.pagingSearch.pageSize}
                                            onShowSizeChange = {this.onShowSizeChange}
                                            onChange = {this.onPageIndexChange}
                                            showTotal = {(total)=>{ return `共${total}条数据`;}}
                                            pageSizeOptions = {['10','20','30','50','100','200']}
                                            total = {this.state.totalRecord}
                                        /> 
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>)
                break;
            }
            return black_content; 
        }
}


const WrappedManage = Form.create()(ExclusiveUniformManagement);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //列表
        GoodStudentInquiryList: bindActionCreators(GoodStudentInquiryList, dispatch),
        examBatchSelectByItem: bindActionCreators(examBatchSelectByItem, dispatch),
        ResultInputListSave: bindActionCreators(ResultInputListSave, dispatch), 
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);