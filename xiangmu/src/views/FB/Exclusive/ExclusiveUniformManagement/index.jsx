

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Select,Input,DatePicker,Table,Pagination,Button,InputNumber, message } from 'antd';
const FormItem = Form.Item; 
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getDictionaryTitle,formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import { dataBind,timestampToTime } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import SelectItem from '@/components/BizSelect/SelectItem';
import FileDownloader from '@/components/FileDownloader';
import { StudentsExclusiveList } from '@/actions/stuService';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import Batch from './batch';
 
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
                pagingSearch:{
                    pageSize:10,
                    currentPage:1,
                    teachCenterId:'',
                    itemId:'',
                    courseCategoryId:'', 
                    studyUniversityEnterYear:'',
                    havePrivateTeacher:'',
                    universityName:'',
                    privateTeacherName:'',
                    orderCreateDateStart:'',
                    orderCreateDateEnd:'',
                    privateTeacherStartDate:'',
                    privateTeacherEndDate:''
                },
                UserSelecteds:[]
            }
        }
        componentWillMount(){
            // this.onSearch();
            this.loadBizDictionary(['sex'])
        } 
            
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;    
            let orderDate = condition.orderCreateDateStart;
            let firstDate = condition.privateTeacherStartDate;
            if(Array.isArray(orderDate)){
                condition.orderCreateDateStart = formatMoment(orderDate[0]);
                condition.orderCreateDateEnd = formatMoment(orderDate[1]);
            }
            if(Array.isArray(firstDate)){
                condition.privateTeacherStartDate = formatMoment(firstDate[0]);
                condition.privateTeacherEndDate = formatMoment(firstDate[1]);
            } 
            let num = /^\d{4}$/;
            let onOff = num.test(condition.studyUniversityEnterYear);
            if(condition.studyUniversityEnterYear){
                if(!onOff)return message.warning('入学年份必须为四位纯数字');
            }
            this.setState({ loading: true });
            this.props.StudentsExclusiveList(condition).payload.promise.then((response) => {
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
        columns = [
            {
                title:'教学点',
                fixed:'left',
                dataIndex:'teacherCenterName', 
                width:'120'
            },
            {
                title:'学服姓名',
                dataIndex:'privateTeacherName', 
                width:'120'
            }, 
            {
                title:'学服电话',
                dataIndex:'privateTeacherMobile', 
                width:'120'
            }, 
            {
                title:'学生姓名',
                dataIndex:'studentName', 
                width:'120',
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('oldViewStudentDetail', record); }}>{text}</a>
                    </span>
                }
            },
            {
                title:'入学年份',
                dataIndex:'studyUniversityEnterYear', 
                width:'120'
            },
            {
                title:'就读高校',
                dataIndex:'universityName', 
                width:'120'
            },
            {
                title:'订单项目',
                dataIndex:'itemName',  
            },
            {
                title:'最新订单日期',
                dataIndex:'createDate', 
                width:'160',
                render:(text,record)=>{
                    return timestampToTime(record.createDate)
                }
            },
            {
                title:'性别',
                dataIndex:'gender', 
                width:'120',
                render:(text,record)=>{
                    return getDictionaryTitle(this.state.sex,record.gender)
                }
            },
            {
                title:'证件号码',
                dataIndex:'certificateNo', 
                width:'160'
            },
            {
                title:'手机号',
                fixed:'right',
                dataIndex:'mobile', 
                width:'120'
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
        //批量设置
        setTeachers = () => {
            let onOff = false;  
            this.state.selectDataList.forEach((item,index)=>{ 
                if(this.state.selectDataList[index+1]){
                    if(item.teacherCenterName != this.state.selectDataList[index+1].teacherCenterName){
                        onOff = true;
                    }
                }
            }) 
            if(onOff)return message.warning('所选教学点不一致！') 
            this.setState({
                editMode:'Teacher'
            })
        }
        render(){ 
            const { getFieldDecorator } = this.props.form;
            let black_content = <div></div>; 
            switch(this.state.editMode){
                case 'oldViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'Teacher':
                    black_content = <Batch viewCallback={this.onViewCallback} {...this.state}/>
                break;
                default:
                    const rowSelection  = {
                        onChange:(selectedRowKeys,selectedRows)=>{ 
                            this.setState({
                                UserSelecteds:selectedRowKeys,
                                selectDataList:selectedRows,
                                selectedRowKeys
                            })
                        },
                        getCheckboxProps:record=>({
                            
                        }),
                        selectedRowKeys:this.state.UserSelecteds
                    }
                    const prefixSelector = getFieldDecorator('textKey',{
                        initialValue:dataBind(this.state.pagingSearch.textKey || 'studentName'),
                    })(
                        <Select style={{width:80}}> 
                            <Option value='studentName'>姓名</Option>
                            <Option value='mobile'>手机号</Option>
                            <Option value='certificateNo'>证件号</Option>
                            <Option value='orderSn'>订单号</Option> 
                        </Select>
                    )
                    let extendButtons = [];
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
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
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置科目项 */ }
                                                            this.props.form.resetFields(['courseCategoryId']);
                                                            // this.onSearch();
                                                        }, 500);
                                                    }}
                                                    />
                                                )}
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
                                                label={'入学年份'}
                                            >
                                                {getFieldDecorator('studyUniversityEnterYear',{
                                                    initialValue:this.state.pagingSearch.studyUniversityEnterYear,
                                                })( 
                                                    <Input placeholder='请输入入学年份' />
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
                                                label={'学服设置情况'}
                                            >
                                                {getFieldDecorator('havePrivateTeacher',{initialValue:this.state.pagingSearch.havePrivateTeacher})(
                                                   <Select>
                                                       <Option value=''>全部</Option>
                                                       <Option value='1'>已设置</Option>
                                                       <Option value='0'>未设置</Option>
                                                   </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'首次学服设置日期'}
                                            >
                                                {getFieldDecorator('privateTeacherStartDate', { initialValue: this.state.pagingSearch.privateTeacherStartDate?[moment(this.state.pagingSearch.privateTeacherStartDate,dateFormat),moment(this.state.pagingSearch.privateTeacherEndDate,dateFormat)]:[] })(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'订单日期'}
                                            >
                                                {getFieldDecorator('orderCreateDateStart', { initialValue: this.state.pagingSearch.orderCreateDateStart?[moment(this.state.pagingSearch.orderCreateDateStart,dateFormat),moment(this.state.pagingSearch.orderCreateDateEnd,dateFormat)]:[] })(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'学服姓名'}
                                            >
                                                {getFieldDecorator('privateTeacherName',{initialValue:this.state.pagingSearch.privateTeacherName})(
                                                    <Input placeholder='请输入学生姓名' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}></Col>
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
                                scroll={{x:1600}}
                                rowClassName={record=>record.zbPayeeTypeIsEquals == false?'highLight_column':''}
                                rowSelection = { rowSelection }
                            />
                            <div className='space-default'></div>
                            <div calssName='search-paging'>
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={24}>
                                        {
                                            this.state.UserSelecteds.length ?
                                            <Button loading={this.state.loading} icon="align-center" onClick={()=>this.setTeachers()}>批量设置</Button>
                                            :
                                            <Button icon="align-center" disabled>批量设置</Button>
                                        }    
                                        <div className='split_button' style={{ width: 10 }}></div>
                                        <FileDownloader
                                            apiUrl={'/edu/student/exportStudentPrivateTeacher'}//api下载地址
                                            method={'post'}//提交方式
                                            options={this.state.pagingSearch}//提交参数
                                            title={'导出'}
                                        >
                                        </FileDownloader> 
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
                                            total = {this.state.totalRecord}
                                            pageSizeOptions = {['10','20','30','50','100','200']}
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
        StudentsExclusiveList: bindActionCreators(StudentsExclusiveList, dispatch),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);