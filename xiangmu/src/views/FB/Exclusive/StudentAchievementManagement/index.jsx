

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Select,Input,DatePicker,Table,Pagination,Button,Modal, message } from 'antd';
const FormItem = Form.Item;  
const confirm = Modal.confirm; 
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic'; 
import ContentBox from '@/components/ContentBox';
import { dataBind,timestampToTime } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import SelectItem from '@/components/BizSelect/SelectItem';
import FileDownloader from '@/components/FileDownloader';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';  
import { StudentAchievementManagementList,ResultInputListSave } from '@/actions/stuService';
import { getExamBatchByItem } from '@/actions/course';
import DropDownButton from '@/components/DropDownButton';
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
                    courseCategoryId:'', 
                    realName:'',
                    mobile:'',
                    universityName:'',
                    certificateNo:'',
                    orderSn:'',
                    examBatchId:'',
                    score:'',
                    state:'',
                    scoreFile:''
                }, 
            }
        }
        componentWillMount(){
            this.loadBizDictionary(['sex'])
            // this.onSearch(); 
        } 
            
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;     

            this.setState({ loading: true });
            this.props.StudentAchievementManagementList(condition).payload.promise.then((response) => {
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
            this.props.getExamBatchByItem(value).payload.promise.then((response) => {
                let data = response.payload.data;
                if(data.state === 'success'){
                  var list = [];
                  data.data.map(item => {
                    list.push({value: item.examBatchId, title: item.examBatchName});
                  })
                  this.setState({
                    dic_exam_batch: list
                  })
                }
              });
        }
        columns = [
            {
                title:'学生姓名',
                fixed:'left',
                dataIndex:'realName', 
                width:'120',
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('oldViewStudentDetail', record); }}>{text}</a>
                    </span>
                }
            },
            {
                title:'教学点', 
                dataIndex:'teachCenterName', 
                width:'120'
            },
            {
                title:'手机号',
                dataIndex:'mobile', 
                width:'120'
            }, 
            {
                title:'就读高校',
                dataIndex:'universityName', 
                width:'120'
            }, 
            {
                title:'科目',
                dataIndex:'courseCategoryName', 
                // width:'120'
            },
            {
                title:'考季',
                dataIndex:'examBatchName', 
                width:'120'
            },
            {
                title:'分数',
                dataIndex:'score',  
                width:'60'
            },
            {
                title:'通过情况',
                dataIndex:'stateMsg', 
                width:'120', 
            },
            {
                title:'成绩附件',
                dataIndex:'scoreFile', 
                width:'120',
                render: (text,record) => {
                    if(record.scoreFile!=null && record.scoreFile != ''){
                        return <FileDownloader
                            apiUrl={'/edu/file/getFile'}//api下载地址
                            method={'post'}//提交方式
                            options={{ filePath: record.scoreFile }}//提交参数
                            title={'附件'}
                        >
                        </FileDownloader>
                    }else{
                        return '';
                    }
                }
            },
            {
                title:'考试日期',
                dataIndex:'examDate', 
                width:'120',
                render:(text,record)=>{
                    return timestampToTime(record.examDate)
                }
            },
            {
                title:'证件号', 
                dataIndex:'certificateNo', 
                width:'160'
            },
            {
                title:'操作',
                fixed:'right', 
                width:'120',
                render:(text,record)=>{
                    return  <DropDownButton>
                                <Button loading={this.state.loading} icon="align-center" onClick={()=>this.onLookView('Result',record)}>编辑</Button>
                                {(!record.score || record.state==2)&&<Button loading={this.state.loading} icon="align-center" onClick={()=>this.deleteStudent(record)}>删除</Button>}
                            </DropDownButton>
                }
            }
        ]
        deleteStudent = (value) => {
            let that = this;
            confirm({
              title: '您确定删除此学生的报考及成绩信息吗？',
              content: '',
              onOk() { 
                value.delFlag = 1;
                that.props.ResultInputListSave(value).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if(data.state == 'success'){
                        message.success('删除成功！')
                        that.onSearch()
                    }else{
                        message.error(data.msg);
                    }
                 }
                )
              },
              onCancel() {
                console.log('Cancel');
              },
            });
          }
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
                case 'oldViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'Result':
                    black_content = <Result viewCallback={this.onViewCallback} {...this.state}/>
                break;
                default: 
                    const prefixSelector = getFieldDecorator('textKey',{
                        initialValue:dataBind(this.state.pagingSearch.textKey || 'realName'),
                    })(
                        <Select style={{width:80}}> 
                            <Option value='realName'>姓名</Option>
                            <Option value='mobile'>手机号</Option>
                            <Option value='certificateNo'>证件号</Option>
                            <Option value='orderSn'>订单号</Option> 
                        </Select>
                    )
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed && 
                                <Form
                                    className='search-form'
                                >
                                    <Row gutter = {24} type='flex'>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'教学点'}
                                            >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser />
                                            )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'项目'}>
                                                {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId
                                                })(
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    hidePleaseSelect={true}
                                                    isFirstSelected={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.state.pagingSearch.courseCategoryId = '';
                                                        this.ExaminationNew(value)
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
                                            label = '科目'
                                            >
                                            {
                                                getFieldDecorator('courseCategoryId',{ 
                                                    initialValue:this.state.pagingSearch.courseCategoryId,
                                                    // rules: [{
                                                    // required: true, message: '请选择科目!',
                                                    // }],
                                                })( 
                                                <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                                )
                                            }
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'多条件查询'}
                                            >
                                                {getFieldDecorator('textValue',{
                                                    initialValue:this.state.pagingSearch.textValue
                                                })(
                                                    <Input placeholder='请输入查询条件' addonBefore={prefixSelector} />
                                                )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'就读高校'}
                                            >
                                                {getFieldDecorator('universityName',{initialValue:this.state.pagingSearch.universityName})(
                                                    <Input placeholder='请输入高校名称' />
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
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'分数'}
                                            >
                                                {getFieldDecorator('score',{initialValue:this.state.pagingSearch.score})(
                                                   <Select>
                                                       <Option value=''>全部</Option>
                                                       <Option value='1'>有</Option>
                                                       <Option value='0'>无</Option>
                                                   </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'通过情况'}
                                            >
                                                {getFieldDecorator('state',{initialValue:this.state.pagingSearch.state})(
                                                   <Select>
                                                       <Option value=''>全部</Option>
                                                       <Option value='0'>无信息</Option>
                                                       <Option value='1'>通过</Option>
                                                       <Option value='2'>未通过</Option>
                                                   </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'附件情况'}
                                            >
                                                {getFieldDecorator('scoreFile',{initialValue:this.state.pagingSearch.scoreFile})(
                                                   <Select>
                                                       <Option value=''>全部</Option>
                                                       <Option value='1'>有</Option>
                                                       <Option value='0'>无</Option> 
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
                                scroll={{x:1500}}
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
        StudentAchievementManagementList: bindActionCreators(StudentAchievementManagementList, dispatch),
        getExamBatchByItem: bindActionCreators(getExamBatchByItem, dispatch),
        ResultInputListSave: bindActionCreators(ResultInputListSave, dispatch), 
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);