

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Select,Input,DatePicker,Table,Pagination,Button,Modal, message } from 'antd';
const FormItem = Form.Item;  
const confirm = Modal.confirm; 
const { RangePicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic'; 
import ContentBox from '@/components/ContentBox';
import { dataBind,timestampToTime,getDictionaryTitle,formatMoment } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import SelectItem from '@/components/BizSelect/SelectItem';
import FileDownloader from '@/components/FileDownloader'; 
import { GoodSApplicationHeadTAdminList,BonusPayment,BatchSubmissionForAudit,BatchSubmissionForDelete } from '@/actions/stuService'; 
import { examBatchSelectByItem,TeachingPointCourseFB } from '@/actions/base';
import DropDownButton from '@/components/DropDownButton';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents'; 
import Result from './Result';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
 
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
                UserSelecteds:[],
                CourseClass:[],
                TipsArr:{},
                UserSelecteds:[],
                dic_exam_batch:[],
                pagingSearch:{
                    pageSize:10,
                    currentPage:1,
                    teachCenterId:'',
                    itemId:'',
                    examBatchId:'', 
                    courseArrangeId:'', 
                    mobile:'',
                    studentName:'',
                    certificateNo:'', 
                    isGrant:'',
                    startApplyDate:'',
                    endApplyDate:'',
                    auditStatus:''
                }, 
            }
        }
        componentWillMount(){
            this.loadBizDictionary(['sex','student_change_status_front'])
            // this.onSearch(); 
            //课程班名称随教学点联动
            this.ChangesTeachingPoints();
        } 
            
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;     
            let startApplyDate = condition.startApplyDate;
            if(Array.isArray(startApplyDate)){
                condition.startApplyDate = formatMoment(startApplyDate[0])
                condition.endApplyDate = formatMoment(startApplyDate[1])
            }
            condition.auditPosition = 0;
            this.setState({ loading: true });
            this.props.GoodSApplicationHeadTAdminList(condition).payload.promise.then((response) => {
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
            this.props.examBatchSelectByItem({itemId:value}).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state === 'success'){
                    // var list = [];
                    data.data.forEach(item => {
                        // list.push({value: item.examBatchId, title: item.examBatchName});
                        item.value = item.examBatchId;
                        item.title = item.examBatchName
                    })     
                    if(data.data.length){ 
                        this.state.pagingSearch.examBatchId = data.data[0].value;
                        this.setState({ pagingSearch: this.state.pagingSearch,TipsArr:data.data[0] }); 
                    }else{
                        this.state.pagingSearch.examBatchId = '';
                        this.setState({ pagingSearch: this.state.pagingSearch,TipsArr:{} }); 
                    }
                    this.setState({
                        dic_exam_batch: data.data
                    })
                }
                }); 
        }
        columns = [
            { 
                title:'项目', 
                dataIndex:'itemName',
                fixed:'left', 
                width:'120', 
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
                title:'课程班名称',
                dataIndex:'courseplanName', 
                width:'120'
            }, 
            {
                title:'学生姓名',
                dataIndex:'studentName', 
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
                    </span>
                },
                width:'120'
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
                title:'当前状态', 
                dataIndex:'auditStatus', 
                width:'160',
                render:(text,record)=>{ 
                    return record.auditStatus==1?'审核中':record.auditStatus == 2?'审核通过':record.auditStatus==3?'审核不通过':record.auditStatus==0?'暂存':'';
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
                title:'奖学金是否发放', 
                dataIndex:'isGrant', 
                width:'160',
                render:(text,record)=>{ 
                    return record.isGrant == 1?'已发放':record.isGrant == 0?'未发放':''
                }
            }, 
            {
                title:'操作',
                fixed:'right', 
                width:'120',
                render:(text,record)=>{
                    return  <DropDownButton>
                                {
                                    record.show && (record.auditStatus == 0 || record.auditStatus == 3)  && <Button loading={this.state.loading} icon="align-center" onClick={()=>this.onLookView('examine',record)}>编辑</Button>
                                } 
                                {
                                    record.auditStatus == 0  && <Button loading={this.state.loading} icon="align-center" onClick={()=>this.deleteOne(record)}>删除</Button>
                                } 
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
        //课程班名称随教学点联动
        ChangesTeachingPoints = (value) => {
            let condition = {};
            condition.teachCenterId = value || ''
            this.props.TeachingPointCourseFB(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state=='success'){
                let { pagingSearch } = this.state;
                pagingSearch.courseArrangeId = ''
                    this.setState({
                        CourseClass:data.data,
                        pagingSearch  
                    })
                    this.props.form.resetFields(['courseArrangeId']); 
                }else{
                    message.error(data.msg)
                }
            })
        }
        BatchAudit = () => {
            let arr = [];
            this.state.sureList.forEach(item=>{
                arr.push(item.goodStudentId)
            })
            let that = this;
            confirm({
                title: '是否提交审核?',
                content: '',
                onOk() { 
                    that.props.BatchSubmissionForAudit({goodStudentIds:arr.join(',')}).payload.promise.then((response) => {
                        let data = response.payload.data;  
                        if(data.state == 'success'){
                            message.success('操作成功！')
                            that.setState({
                                sureList:[],
                                UserSelecteds:[]
                            })
                            that.onSearch();
                        }else{
                            message.error(data.msg)
                        }
                        }
                    )
                },
                onCancel() {
                  console.log('Cancel');
                },
              });
        }
        deleteOne = (value) => { 
            let that = this;
            confirm({
                title: '是否确定删除?',
                content: '',
                onOk() {
                    that.props.BatchSubmissionForDelete({goodStudentIds:value.goodStudentId}).payload.promise.then((response) => {
                        let data = response.payload.data;  
                            if(data.state == 'success'){
                                message.success('删除成功！')
                                that.onSearch();
                            }else{
                                message.error(data.msg)
                            }
                        }
                    )
                },
                onCancel() {
                  console.log('Cancel');
                },
              });
        }
        BatchDelete = () => { 
            let arr = [];
            this.state.sureList.forEach(item=>{
                arr.push(item.goodStudentId)
            })
            let that = this;
            confirm({
                title: '是否确定删除?',
                content: '',
                onOk() {
                    that.props.BatchSubmissionForDelete({goodStudentIds:arr.join(',')}).payload.promise.then((response) => {
                        let data = response.payload.data;  
                            if(data.state == 'success'){
                                message.success('删除成功！')
                                that.setState({
                                    sureList:[],
                                    UserSelecteds:[]
                                })
                                that.onSearch();
                            }else{
                                message.error(data.msg)
                            }
                        }
                    )
                },
                onCancel() {
                  console.log('Cancel');
                },
              });
        }
        render(){ 
            const { getFieldDecorator } = this.props.form;
            let black_content = <div></div>; 
            switch(this.state.editMode){
                case 'ViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'View':
                case 'examine':
                    black_content = <Result viewCallback={this.onViewCallback} {...this.state}/>
                break;
                default:  
                    var rowSelection = {
                      selectedRowKeys: this.state.UserSelecteds,
                      onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys,sureList:selectedRows })
                      },
                      getCheckboxProps: record => ({
                        disabled: !(record.show && (record.auditStatus == 0 || record.auditStatus == 3)),    // Column configuration not to be checked
                      }),
                    };
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed && 
                                <Form
                                    className='search-form'
                                >
                                    <Row gutter = {24} type='flex'>
                                        <Col span={8}>
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
                                                        this.ExaminationNew(value)
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置科目项 */ }
                                                            this.props.form.resetFields(['courseCategoryId','examBatchId']);
                                                            this.onSearch();
                                                        }, 500);
                                                    }}
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'考季'}
                                            >
                                            {getFieldDecorator('examBatchId',{initialValue:this.state.pagingSearch.examBatchId})(
                                                <Select
                                                onSelect = {(value,data)=>{ 
                                                    this.setState({
                                                        TipsArr:data.props
                                                    })
                                                }}
                                                >
                                                    <Option value=''>全部</Option>
                                                    {this.state.dic_exam_batch.map((item, index) => {
                                                        return <Option itemName = {item.itemName} examBatchName = {item.examBatchName} endDate = {item.endDate} startDate = {item.startDate} value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                            </FormItem>
                                        </Col>  
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'教学点'}
                                            >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser onChange={(value)=>{this.ChangesTeachingPoints(value)}}/>
                                            )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'课程班名称'}
                                            >
                                            {getFieldDecorator('courseArrangeId',{initialValue:this.state.pagingSearch.courseArrangeId})(
                                                <Select 
                                                >
                                                    <Option value=''>全部</Option>
                                                    {this.state.CourseClass.map((item, index) => {
                                                        return <Option   value={item.courseArrangeId} key={index}>{item.courseplanName}</Option>
                                                    })}
                                                </Select>
                                            )}
                                            </FormItem>
                                        </Col>  
                                        <Col span={8}>
                                            <FormItem
                                                    {...searchFormItemLayout}
                                                    label={'学生姓名'}
                                                >
                                                {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                    <Input placeholder='请输入学生姓名' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                    {...searchFormItemLayout}
                                                    label={'手机号'}
                                                >
                                                {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                    <Input placeholder='请输入手机号' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'申请状态'}
                                            >
                                                {getFieldDecorator('auditStatus',{initialValue:this.state.pagingSearch.auditStatus})( 
                                                    <Select >
                                                        <Option value="">全部</Option> 
                                                        <Option value="1">审核中</Option> 
                                                        <Option value="2">审核通过</Option> 
                                                        <Option value="3">审核不通过</Option>   
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>  
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'奖金是否发放'}
                                            >
                                                {getFieldDecorator('isGrant',{initialValue:this.state.pagingSearch.isGrant})( 
                                                    <Select >
                                                        <Option value="">全部</Option> 
                                                        <Option value="1">已发放</Option> 
                                                        <Option value="0">未发放</Option>  
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={8}></Col> 
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="申请时间">
                                                {getFieldDecorator('startApplyDate', { initialValue: this.state.pagingSearch.startApplyDate?[moment(this.state.pagingSearch.startApplyDate,dateFormat),moment(this.state.pagingSearch.endApplyDate,dateFormat)]:[]})(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col> 
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        <div className="space-default"></div> 
                        <div className="search-result-list">
                            <Table 
                                columns = {this.columns}
                                loading = {this.state.loading}
                                pagination = {false}
                                dataSource = {this.state.data_list}
                                bordered 
                                rowKey = {'goodStudentId'}
                                rowSelection = {rowSelection}
                                rowKey={record=>record.studentPayfeeId}
                                scroll={{x:1800}}
                                rowClassName={record=>record.zbPayeeTypeIsEquals == false?'highLight_column':''} 
                            />
                            <div className='space-default'></div>
                            <div calssName='search-paging'>
                                <Row justify="space-between" align="middle" type="flex"> 
                                    <Col span={24}>  
                                        {
                                            this.state.UserSelecteds.length>0?<Button onClick={this.BatchAudit} icon="calendar">提交审核</Button>:<Button disabled icon="calendar">提交审核</Button>
                                        }  
                                        <div className='split_button' style={{ width: 10 }}></div>
                                        {
                                            this.state.UserSelecteds.length>0?<Button onClick={this.BatchDelete} icon="delete">删除</Button>:<Button disabled icon="delete">删除</Button>
                                        }  
                                    </Col>
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
        GoodSApplicationHeadTAdminList: bindActionCreators(GoodSApplicationHeadTAdminList, dispatch),
        examBatchSelectByItem: bindActionCreators(examBatchSelectByItem, dispatch),
        BonusPayment: bindActionCreators(BonusPayment, dispatch), 
        TeachingPointCourseFB: bindActionCreators(TeachingPointCourseFB, dispatch), 
        //批量审核
        BatchSubmissionForAudit: bindActionCreators(BatchSubmissionForAudit, dispatch), 
        //批量删除
        BatchSubmissionForDelete: bindActionCreators(BatchSubmissionForDelete, dispatch), 
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);