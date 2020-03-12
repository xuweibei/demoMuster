import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form,Row,Col,Select,DatePicker,Input,Table,Pagination,Button,Modal,message } from 'antd';
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const dateFormat = 'YYY-MM-DD';
import moment from 'moment';
import { dataBind,timestampToTime,formatMoment } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import DropDownButton from '@/components/DropDownButton';
import { ManagementOfStudentsCourseSelectionList,courseplanNameSelectionList } from '@/actions/stuService'; 
import { deleteByPrimaryKeyForBatch } from '@/actions/base';
import Edit from './Edit';
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
                courseplanBatchId:'',
                courseCategoryId:'',
                courseArrangeId:'',
                teachCenterId:'',
                hasAttend:'',
                selectCourseStartDate:'',
                selectCourseEndDate:'',
                differentPlacesSelection:''
            },
            UserSelecteds:[]
        }
    }
    // componentDidMount(){
    //     this.onSearch()
    // }
    fetch = (params = {} )=>{
        var condition = params || this.state.pagingSearch;
        let dataArr = condition.selectCourseStartDate;
        if(Array.isArray(dataArr)){
            condition.selectCourseStartDate = formatMoment(dataArr[0]);
            condition.selectCourseEndDate = formatMoment(dataArr[1]);
        }
        this.setState({loading:true});
        this.props.ManagementOfStudentsCourseSelectionList(condition).payload.promise.then((response)=>{
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
    courseplanNameSelect = (id) =>{  
        this.props.courseplanNameSelectionList({courseCategoryId:id}).payload.promise.then((response)=>{
            let data = response.payload.data;
            if(data.state=='success'){
                let { pagingSearch } = this.state;
                pagingSearch.courseplanName = ''
                    this.setState({
                        CourseClass:data.data,
                        pagingSearch  
                })
                this.props.form.resetFields(['courseplanName']); 
            }else{
                message.error(data.msg)
            }
        })
    }
    columns = [
        {
            title:'开课批次',
            fixed:'left',
            dataIndex:'courseplanBatchName',
            width:120, 
        },
        {
            title:'学生教学点', 
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
            title:'手机号', 
            dataIndex:'mobile',
            width:120, 
        },
        {
            title:'项目', 
            dataIndex:'itemName',
            width:120, 
        },
        {
            title:'科目', 
            dataIndex:'courseCategoryName',
            width:120, 
        },
        {
            title:'是否历史科目', 
            dataIndex:'isHistory',
            width:120, 
            render:(text,record)=>{
                return record.isHistory?'是':'否'
            }
        },
        {
            title:'课程班', 
            dataIndex:'courseplanName',
            width:120, 
        },
        {
            title:'选课日期', 
            dataIndex:'selectCourseDate',
            width:120, 
            render:(text,record)=>{
                return timestampToTime(record.selectCourseDate)
            }
        },
        {
            title:'操作人', 
            dataIndex:'operatorName',
            width:120, 
        },
        {
            title:'异地选课', 
            dataIndex:'differentPlacesSelection',
            width:120, 
            render:(text,record)=>{
                return record.differentPlacesSelection?'是':'否'
            } 
        },
        {
            title:'考勤录入', 
            dataIndex:'hasAttend',
            width:120,
            render:(text,record)=>{
                return record.hasAttend?'已录入':'未录入'
            } 
        },
        {
            title:'操作', 
            dataIndex:'',
            width:120, 
            fixed:'right',
            render:(text,record)=>{
                return record.check?<DropDownButton>
                <Button onClick = {()=>this.onLookView('Edit',record)}>编辑</Button>
                <Button onClick={()=>this.deleteStudent(record)}>删除</Button>
            </DropDownButton>:'--'
            }
        },
    ]
    deleteStudent = (value) => {
        let that = this; 
        confirm({
          title: '您确定删除此学生的选课信息吗？',
          content: '',
          onOk() { 
            // value.delFlag = 1; 
            that.props.deleteByPrimaryKeyForBatch({ids:value.courseArrangeStudentId}).payload.promise.then((response) => {
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
    DeleteAll = () => { 
        let conditio = {};
        let idsArr = [];
        let that = this;
        this.state.selectDataList.forEach(item=>{
            idsArr.push(item.courseArrangeStudentId)
        });
        conditio.ids = idsArr.join(',')
        confirm({
            title:'您确定删除此学生的选课信息吗？',
            content:'',
            onOk(){
                that.props.deleteByPrimaryKeyForBatch(conditio).payload.promise.then((response) => {
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
            onCancel(){

            }
        })
    }
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
            case 'Edit':
                black_content = <Edit viewCallback = {this.onViewCallback} {...this.state} />
            break;
            case '':
            break;
            default:
            const prefixSelector = getFieldDecorator('textKey',{
                initialValue:dataBind(this.state.pagingSearch.textKey || 'studentName'),
            })(
                <Select style={{width:80}}> 
                    <Option value='studentName'>姓名</Option>
                    <Option value='mobile'>手机号</Option>
                    <Option value='weixin'>微信</Option>
                    <Option value='qq'>QQ</Option>
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
            black_content = <div>456</div>
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
                                            label={'项目'}
                                        >
                                        {getFieldDecorator('itemId',{
                                            initialValue:this.state.pagingSearch.itemId
                                        })(
                                            <SelectItem 
                                                scope={'my'}
                                                hideAll = {true}
                                                hidePleaseSelect = {true}
                                                isFirstSelected = {true}
                                                onSelectChange={(value)=>{
                                                    this.state.pagingSearch.itemId = value;
                                                    this.state.pagingSearch.courseCategoryId = '';
                                                    this.setState({
                                                        pagingSearch:this.state.pagingSearch
                                                    })
                                                    this.onSearch();
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
                                            label={'开课批次'}
                                        >
                                            {getFieldDecorator('courseplanBatchId',{
                                                initialValue:this.state.pagingSearch.courseplanBatchId
                                            })(
                                                <SelectItemCoursePlanBatch itemId = {this.state.pagingSearch.itemId} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                         {...searchFormItemLayout}
                                         label={'科目'}
                                        >
                                            {getFieldDecorator('courseCategoryId',{
                                                initialValue:this.state.pagingSearch.courseCategoryId
                                            })(
                                                <SelectItemCourseCategory
                                                onChange={this.courseplanNameSelect}
                                                isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="课程班">
                                            {getFieldDecorator('courseArrangeId', { initialValue: this.state.pagingSearch.courseArrangeId })(
                                            <Select>
                                                <Select.Option value="">全部</Select.Option>
                                                {this.state.CourseClass.map((item, index) => {
                                                return <Select.Option value={item.courseArrangeId} key={index}>{item.courseplanFullName}</Select.Option>
                                                })} 
                                            </Select>
                                            )}
                                        </FormItem>
                                    </Col>
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
                                            label={'考勤录入情况'}
                                        >
                                        {getFieldDecorator('hasAttend',{initialValue:this.state.pagingSearch.hasAttend})(
                                            <Select>
                                                <Select.Option value=''>全部</Select.Option>
                                                <Select.Option value='1'>已录入</Select.Option>
                                                <Select.Option value='0'>未录入</Select.Option>
                                            </Select>
                                        )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label={'选课日期'}
                                        > 
                                        {getFieldDecorator('selectCourseStartDate', { initialValue: this.state.pagingSearch.selectCourseStartDate?[moment(this.state.pagingSearch.selectCourseStartDate,dateFormat),moment(this.state.pagingSearch.selectCourseEndDate,dateFormat)]:[] })(
                                            <RangePicker style={{width:220}}/>
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
                                            label={'异地选课'}
                                        >
                                        {getFieldDecorator('differentPlacesSelection',{initialValue:this.state.pagingSearch.differentPlacesSelection})(
                                            <Select>
                                                <Select.Option value=''>全部</Select.Option>
                                                <Select.Option value='1'>是</Select.Option>
                                                <Select.Option value='0'>否</Select.Option>
                                            </Select>
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
                                rowSelection = { rowSelection }
                            />  
                            <div className='space-default'></div>
                            <div className='search-paging'>
                                <Row justify='space-between' align='middle' type='flex'>
                                    <Col span={2}>
                                        {
                                            this.state.UserSelecteds.length ? 
                                            <Button onClick = {this.DeleteAll} icon='delete'>批量删除</Button>
                                            : 
                                            <Button disabled icon='delete'>批量删除</Button>
                                        }
                                    </Col>
                                    <Col span={22} className='search-paging-control'>
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
        ManagementOfStudentsCourseSelectionList: bindActionCreators(ManagementOfStudentsCourseSelectionList, dispatch),
        //科目下课程班 
        courseplanNameSelectionList: bindActionCreators(courseplanNameSelectionList, dispatch),
        //删除
        deleteByPrimaryKeyForBatch: bindActionCreators(deleteByPrimaryKeyForBatch, dispatch),
         
    }
    
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage)