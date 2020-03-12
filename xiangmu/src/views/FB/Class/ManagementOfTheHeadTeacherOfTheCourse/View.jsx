import React from 'react';
import { bindActionCreators } from 'redux'; 
import { connect } from 'react-redux';
import { loadDictionary } from '@/actions/dic';
import { Form,Row,Col,Input,Select,AutoComplete,Tag,Tooltip,Button,message } from 'antd';
import { searchFormItemLayout,onSearch,renderSearchBottomButtons } from '@/utils/componentExt';
const FormItem = Form.Item; 
import ContentBox from '@/components/ContentBox';  
import { getTeacherList,TeacherOfTheCourseSubmit } from '@/actions/base';

class View extends React.Component {
    constructor(){
        super();
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            tags:[],
            dataSource:[],
            inputVisible:true
        }
    }
    componentWillMount(){
        // console.log(this.props)
        this.fetch();
    }
    fetch = () => {
        this.props.getTeacherList({teachCenterId:this.props.selectDataList[0].teachCenterId,branchId:this.props.branchId}).payload.promise.then((response)=>{
            let data = response.payload.data;  
                if(data.state == 'success'){
                    this.setState({
                        dataSource:data.data
                    })
                }else{
                    message.error(data.msg);
                }
            }
        )
    }
    onSelect = (value, option) => {
        const state = this.state;
        let tags = state.tags;
        var info = this.state.dataSource.find(a => a.userId == option.key);
        if (tags.find(A => A.userId == info.userId) == null) {
            tags = [...tags, info];
        }  
        this.setState({
            tags,
            dataArr:tags,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        }); 
    }
    
    handleSearch = (value) => { 
        var searchOptions = this.props.searchOptions || {};
        var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则 
        if (value && value.indexOf(' ')!=0) {
            
            this.props.getTeacherList({realName:value,teachCenterId:this.props.selectDataList[0].teachCenterId,branchId:this.props.branchId}).payload.promise.then((response) => {

                let data = response.payload.data; 
                if (data.state === 'success') {
                    this.setState({ 
                        dataSource: data.data.map((item) => { 
                            return { 
                                userId: `${item.userId}`,
                                realName: `${item.realName}`, 
                                loginName:item.loginName,
                                department:item.department,
                                state:item.state
                            }
                            
                        })
                    })
                }
                else {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
            })
        
        }
            
        
    }
    
    onCancel = () => {
        this.props.viewCallback();
    }
    renderOption(item) { 
        return <Option value={item.userId} key={item.userId} text={item.realName}>
                  {item.realName+' '+item.loginName}
                  {/* <span style={{float:'right'}}>{item.isPack ? item.isPack : ''}</span> */}
                </Option>
    }
    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag.userId.toString() != removedTag.userId); 
        this.setState({ tags,inputVisible:true,dataArr:[] }); 
    } 

    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if(!this.state.tags.length)return message.warning('请输入正确的班主任姓名');
                that.setState({ loading: true });  
                let ids = [];
                this.props.selectDataList.forEach(item=>{
                    ids.push(item.courseArrangeId);
                })
                values.ids = ids.join(',')
                values.classTeacherId = this.state.tags[0].userId;  
                this.props.TeacherOfTheCourseSubmit(values).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state === 'success') { 
                        message.success('设置成功！')
                        this.props.viewCallback('set')
                      }
                      else {
                        this.setState({ loading: false })
                        message.error(data.message);
                      }
                })
                if (this.props.editMode == 'Audit') {
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }
            }
        });
    }
    render(){
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>; 
        switch(this.props.editMode){
            case 'View':
            break;
            case 'Teacher':
            default:
            let extendButtons = []; 
            extendButtons.push(
                <Button onClick={this.onSubmit} icon="save">确定</Button>
            )
            extendButtons.push(
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            )
                block_content = (
                    <div>
                        <ContentBox titleName='班主任批量设置' bottomButton={this.renderSearchBottomButtons(extendButtons,'l','r')}>
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}  type="flex">  
                                    <Col span={24}>
                                        <div style={{marginBottom:'10px',fontWeight:'800'}}>您批量选择了<span style={{color:'red',margin:'0 6px'}}>{this.props.selectDataList.length?this.props.selectDataList[0].teacherCenterName:''}</span>教学点<span style={{color:'red',margin:'0 6px'}}>{this.props.selectDataList.length?this.props.selectDataList.length:''}</span>个课程班，进行班主任的设置 ，请选择班主任老师【支持按姓名模糊查询】</div>
                                    </Col>
                                    <Col span={6}></Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'班主任'}>
                                            {getFieldDecorator('classTeacherId',{
                                                initialValue:''
                                            })(
                                                <div>
                                                    {this.state.tags.map((tag, index) => { 
                                                        const isLongTag = (tag.realName.length+tag.loginName.length) > 20;
                                                        const tagElem = (
                                                            <Tag value={tag.userId} key={tag.userId} closable afterClose={() => this.handleClose(tag)}>
                                                                {isLongTag ? `${(tag.realName+' '+ tag.loginName).slice(0, 20)}...` : tag.realName+' '+ tag.loginName}
                                                            </Tag>
                                                        );
                                                        return isLongTag ? <Tooltip title={tag.realName}>{tagElem}</Tooltip> : tagElem;
                                                    })}
                                                    {this.state.inputVisible && (
                                                        <AutoComplete
                                                            dataSource={this.state.dataSource.map(this.renderOption)}
                                                            onSelect={this.onSelect}
                                                            onSearch={this.handleSearch}
                                                            placeholder="支持名称模糊搜索"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}></Col>
                                </Row>
                            </Form>
                        </ContentBox>
                    </div>
                )
            break;
        }
        return block_content;
    }
}
const WrappendCourseManage = Form.create()(View);


const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    let branchId = state.auth.currentUser.userType.orgId;
    return { Dictionarys, branchId }
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary: bindActionCreators(loadDictionary,dispatch),
        getTeacherList:bindActionCreators(getTeacherList,dispatch),
        TeacherOfTheCourseSubmit:bindActionCreators(TeacherOfTheCourseSubmit,dispatch)
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappendCourseManage);