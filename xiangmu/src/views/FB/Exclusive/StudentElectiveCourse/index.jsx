import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form,Row,Col,Select,DatePicker,Input,Table,Pagination,Button,Modal,message } from 'antd';
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const dateFormat = 'YYY-MM-DD';
import moment from 'moment';
import { dataBind,timestampToTime } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem'; 
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import DropDownButton from '@/components/DropDownButton';
import { StudentElectiveCourseList } from '@/actions/stuService';
import { TeachingPointCourseFB } from '@/actions/base'; 
import Selection from './selection';
import History from './History';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

class Elective extends React.Component {
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
            data_list :'',
            CourseClass:[],
            pagingSearch:{
                pageSize:10,
                currentPage:1,
                itemId:'',  
                teachCenterId:'',
                universityName:'',
                studyUniversityEnterYear:''
            },
            UserSelecteds:[]
        }
    }
    componentWillMount(){
        this.onSearch();
    }
    fetch = (params = {} )=>{
        var condition = params || this.state.pagingSearch;
        let num = /^\d{4}$/;
        let onOff = num.test(condition.studyUniversityEnterYear);
        if(condition.studyUniversityEnterYear){
            if(!onOff)return message.warning('入学年份必须为四位纯数字');
        }
        this.setState({loading:true});
        this.props.StudentElectiveCourseList(condition).payload.promise.then((response)=>{
            let data = response.payload.data;
            if(data.state == 'success'){
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord
                })
            }else{
                message.error(data.msg);
            }
            this.setState({
                loading:false
            })
        })
    }
    columns = [
        {
            title:'教学点',
            fixed:'left',
            dataIndex:'teachCenterName',
            width:120, 
        }, 
        {
            title:'学生姓名', 
            dataIndex:'studentName',
            width:120, 
            render: (text, record, index) => {
              return <span>
                      <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
                  </span>
            }
        },
        {
            title:'入学年份', 
            dataIndex:'studyUniversityEnterYear',
            width:120, 
        },
        {
            title:'就读高校', 
            dataIndex:'universityName',
            width:120, 
        },
        {
            title:'订单项目', 
            dataIndex:'orderItmes', 
        },
        {
            title:'最新订单日期', 
            dataIndex:'newOrderDate',
            width:120, 
        },
        {
            title:'性别', 
            dataIndex:'sex',
            width:60, 
        },
        {
            title:'证件号码', 
            dataIndex:'certificateNo',
            width:160, 
        },
        {
            title:'手机号', 
            dataIndex:'mobile',
            width:120, 
        },
        {
            title:'微信号', 
            dataIndex:'weixin',
            width:120, 
        },
        {
            title:'QQ号', 
            dataIndex:'qq',
            width:120, 
        },
        {
            title:'操作', 
            dataIndex:'',
            width:120, 
            fixed:'right',
            render:(text,record)=>{
                return <DropDownButton>
                    <Button onClick = {()=>this.onLookView('Selection',record)}>选课</Button>
                    <Button onClick={()=>this.onLookView('History',record)}>历史科目选课</Button>
                </DropDownButton>
            }
        },
    ]   
    onLookView = (op,item) => {
        this.setState({
            editMode:op,
            currentDataModel: item
        })
    }
    onViewCallback = (data) => {
        if(data){
            this.onSearch();
            this.setState({
                currentDataModel:null,
                editMode:'Mange',
                UserSelecteds:[],
                selectDataList:[],
                selectedRowKeys:[]
            })
        }else{
            this.setState({ currentDataModel:null,editMode:'Manage'})
        }
    }
    render(){ 
        const { getFieldDecorator } = this.props.form;
        let black_content = <div></div>
        switch(this.state.editMode){
            case 'ViewStudentDetail':
                black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
              break;
            case 'Selection':
                black_content = <Selection viewCallback = {this.onViewCallback} {...this.state} />
            break;
            case 'History':
                black_content = <History viewCallback = {this.onViewCallback} {...this.state} />
            break;
            default:
            const prefixSelector = getFieldDecorator('textKey',{
                initialValue:dataBind(this.state.pagingSearch.textKey || 'studentName'),
            })(
                <Select style={{width:80}}> 
                    <Option value='studentName'>姓名</Option>
                    <Option value='mobile'>手机号</Option>
                    <Option value='weixin'>微信号</Option>
                    <Option value='qq'>QQ号</Option>
                    <Option value='certificateNo'>证件号</Option> 
                </Select>
            )
            const rowSelection = {
                onChange:(selectedRowKeys,selectedRows)=>{
                    this.setState({
                        UserSelecteds:selectedRowKeys,
                        selectDataList:selectedRows,
                        selectedRowKeys
                    })
                },
                selectedRowKeys:this.state.UserSelecteds
            }
            black_content = <div></div>
                black_content = (
                    <div>
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed &&  <Form
                                className = 'search-form'
                            >
                                <Row gutter = {24} type='flex'>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label={'学生教学点'}
                                        >
                                        {getFieldDecorator('teachCenterId',{initialValue:this.state.pagingSearch.teachCenterId})(
                                            <SelectTeachCenterByUser />
                                        )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label={'项目'}
                                        >
                                        {getFieldDecorator('itemId',{
                                            initialValue:this.state.pagingSearch.itemId
                                        })(
                                            <SelectItem 
                                                scope={'my'}
                                                hideAll={false}
                                                hidePleaseSelect={true}
                                                onSelectChange={(value)=>{
                                                    this.state.pagingSearch.itemId = value;
                                                    this.state.pagingSearch.courseCategoryId = '';
                                                    this.setState({
                                                        pagingSearch:this.state.pagingSearch
                                                    })
                                                    setTimeout(()=>{
                                                        this.props.form.resetFields(['courseplanBatchId']);
                                                    })
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
                                                initialValue:''
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
                                                rules:[
                                                    {

                                                    }
                                                ]
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
                                            {getFieldDecorator('universityName',{
                                                initialValue:this.state.pagingSearch.universityName,
                                            })( 
                                                <Input placeholder='请输入高校名称' />
                                            )}
                                        </FormItem>
                                    </Col> 
                                </Row>
                            </Form>} 
                        </ContentBox>
                        <div className='space-default'></div> 
                        <div className='search-result-list'>
                            <Table
                                columns = { this.columns }
                                loading = { this.state.loading }
                                pagination = { false }
                                dataSource = { this.state.data_list }
                                bordered
                                rowKey = {record => record.studentPayfeeId}
                                scroll = {{x:1500}}
                                rowClassName = { record=> record.zbPayeeTypeIsEquals == false?'highLight_column':''}
                                // rowSelection = { rowSelection }
                            />  
                            <div className='space-default'></div>
                            <div className='search-paging'>
                                <Row justify='space-between' align='middle' type='flex'> 
                                    <Col span={24} className='search-paging-control'>
                                        <Pagination
                                            showSizeChanger
                                            current = { this.state.pagingSearch.currentPage }
                                            defaultPageSize = { this.state.pagingSearch.pageSize}
                                            pageSize = { this.state.pagingSearch.pageSize }
                                            onShowSizeChange = { this.onShowSizeChange } 
                                            onChange = { this.onPageIndexChange }
                                            showTotal = { ( total ) => {return `共${total}条数据`;}}
                                            total = { this.state.totalRecord }
                                            pageSizeOptions = {['10','20','30','50','100','200']}
                                        />
                                    </Col>
                                </Row>
                                <Row justify='end' align='middle' type='flex'>
                                </Row>
                            </div>
                        </div>
                    </div>
                ) 
            break;
        } 
        return black_content;
    }
    
}

const WrappedManage = Form.create()(Elective);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys }
}

function mapDispatchToProps(dispatch){
    return {
        //科目下课程班
        TeachingPointCourseFB: bindActionCreators(TeachingPointCourseFB, dispatch),
        StudentElectiveCourseList: bindActionCreators(StudentElectiveCourseList, dispatch),

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage)